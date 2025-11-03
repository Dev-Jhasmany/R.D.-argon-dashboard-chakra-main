/**
 * COMPONENTE: ConfirmPayment (Confirmar Pagos de Pedidos Online)
 *
 * Este componente permite al cajero validar los pagos de pedidos realizados
 * desde la tienda online (/customer/checkout).
 *
 * FLUJO:
 * 1. Cliente realiza pedido online → orden creada con estado "pending_payment"
 * 2. Cajero ve lista de pedidos pendientes de pago
 * 3. Cajero valida el pago (QR, PayPal, Stripe)
 * 4. Cambia estado a "paid" y crea venta en el sistema
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import api from 'services/api';

function ConfirmPayment() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadPendingOrders();

    // Actualizar cada 5 segundos para detectar nuevos pedidos
    const intervalId = setInterval(() => {
      loadPendingOrders();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const loadPendingOrders = async () => {
    setLoading(true);

    try {
      // Obtener todas las ventas y pedidos del backend
      const [salesResponse, ordersResponse] = await Promise.all([
        api.get('/sales'),
        api.get('/orders')
      ]);

      const allSales = salesResponse.data;
      const allOrders = ordersResponse.data;

      // Obtener datos de pago desde localStorage (incluye comprobantes)
      const localStorageOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');

      // Fecha de hoy a las 00:00:00
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filtrar ventas online sin pedido asociado y solo del día de hoy
      const pendingOrdersList = allSales
        .filter(sale => {
          // Es venta online si no tiene created_by_id
          const isOnline = !sale.created_by_id;

          // Verificar si ya tiene pedido
          const hasOrder = allOrders.some(order => order.saleId === sale.id);

          // Verificar si es del día de hoy
          const saleDate = new Date(sale.created_at);
          const isToday = saleDate >= today;

          // Verificar si ya fue confirmado en localStorage
          const localOrder = localStorageOrders.find(
            lo => lo.order_number === sale.sale_number
          );
          const isConfirmed = localOrder?.status === 'confirmed';

          // Verificar si tiene comprobante de pago
          const hasPaymentProof = sale.payment_proof && sale.payment_proof.length > 0;

          // Mostrar solo las que son online, no tienen pedido, son de hoy, no están confirmadas Y tienen comprobante
          return isOnline && !hasOrder && isToday && !isConfirmed && hasPaymentProof;
        })
        .map(sale => {
          // Buscar información adicional del pago en localStorage (comprobante, etc)
          const localOrder = localStorageOrders.find(
            lo => lo.order_number === sale.sale_number
          );

          // Extraer información del cliente de las notas
          const notes = sale.notes || '';
          const emailMatch = notes.match(/Email:\s*([^\s-]+)/);
          const addressMatch = notes.match(/Dirección:\s*([^-]+)/);

          return {
            // Mapear al formato que espera el componente
            order_number: sale.sale_number,
            saleId: sale.id, // Guardar el ID real de la venta
            customer_name: sale.customer_name,
            customer_email: emailMatch ? emailMatch[1] : null,
            customer_phone: sale.customer_nit, // Usamos nit como teléfono
            delivery_address: addressMatch ? addressMatch[1].trim() : null,
            payment_method: sale.payment_method,
            total: sale.total,
            created_at: sale.created_at,
            payment_proof: sale.payment_proof, // Comprobante desde el backend
            items: sale.details?.map(d => ({
              product_name: d.custom_name || d.product?.name,
              quantity: d.quantity,
              unit_price: d.unit_price,
              subtotal: d.subtotal
            })) || [],
            // Incluir detalles del pago desde localStorage (comprobante) como fallback
            paymentDetails: localOrder?.paymentDetails || null,
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Más recientes primero

      setPendingOrders(pendingOrdersList);
    } catch (error) {
      console.error('Error al cargar pedidos pendientes:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar pedidos pendientes',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }

    setLoading(false);
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const quickConfirmPayment = async (order) => {
    setProcessingPayment(true);

    try {
      // Llamar al endpoint de confirmación del backend
      await api.patch(`/sales/${order.saleId}/confirm-online`);

      // Actualizar el pedido en localStorage (cambiar estado a 'confirmed')
      const savedOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');

      // Actualizar el estado del pedido en lugar de eliminarlo
      const updatedOrders = savedOrders.map((o) => {
        if (o.order_number === order.order_number) {
          return {
            ...o,
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
          };
        }
        return o;
      });

      localStorage.setItem('pendingPaymentOrders', JSON.stringify(updatedOrders));

      // También guardar en lista de pedidos confirmados para historial
      const confirmedOrder = {
        ...order,
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      };
      const confirmedOrders = JSON.parse(localStorage.getItem('confirmedOrders') || '[]');

      // Evitar duplicados
      const orderExists = confirmedOrders.some(o => o.order_number === order.order_number);
      if (!orderExists) {
        confirmedOrders.push(confirmedOrder);
        localStorage.setItem('confirmedOrders', JSON.stringify(confirmedOrders));
      }

      toast({
        title: 'Pago confirmado',
        description: `El pago del pedido ${order.order_number} ha sido confirmado y el pedido aparecerá en Pedidos Activos`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      // Recargar pedidos pendientes
      loadPendingOrders();
      closeOrderModal();
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.response?.data?.message);

      const errorMessage = error.response?.data?.message || 'Error al confirmar el pago';

      // Si ya existe un pedido, marcar como confirmado también
      if (errorMessage.includes('Ya existe un pedido') || errorMessage.includes('already')) {
        const savedOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');

        // Actualizar estado a confirmado
        const updatedOrders = savedOrders.map((o) => {
          if (o.order_number === order.order_number) {
            return {
              ...o,
              status: 'confirmed',
              confirmed_at: new Date().toISOString()
            };
          }
          return o;
        });

        localStorage.setItem('pendingPaymentOrders', JSON.stringify(updatedOrders));

        toast({
          title: 'Este pedido ya fue confirmado',
          description: 'El pedido ya se encuentra en Pedidos Activos',
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        // Recargar la lista para reflejar el cambio
        loadPendingOrders();
        closeOrderModal();
      } else if (errorMessage.includes('no es una venta online')) {
        // Es una venta que no es online (tiene created_by_id)
        const savedOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
        const remainingOrders = savedOrders.filter(
          (o) => o.order_number !== order.order_number
        );
        localStorage.setItem('pendingPaymentOrders', JSON.stringify(remainingOrders));

        toast({
          title: 'Venta ya procesada',
          description: 'Esta venta no es una venta online o ya fue procesada',
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        loadPendingOrders();
        closeOrderModal();
      } else {
        toast({
          title: 'Error al confirmar pago',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const quickRejectPayment = async (order) => {
    setProcessingPayment(true);

    // Actualizar estado del pedido en localStorage
    const savedOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
    const updatedOrders = savedOrders.map((o) =>
      o.order_number === order.order_number
        ? { ...o, status: 'rejected', rejected_at: new Date().toISOString() }
        : o
    );

    // Remover pedido rechazado de la lista de pendientes
    const remainingOrders = updatedOrders.filter(
      (o) => o.status !== 'rejected'
    );

    localStorage.setItem('pendingPaymentOrders', JSON.stringify(remainingOrders));

    setTimeout(() => {
      toast({
        title: 'Pago rechazado',
        description: `El pedido ${order.order_number} ha sido rechazado`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      // Recargar pedidos pendientes
      loadPendingOrders();
      setProcessingPayment(false);
    }, 500);
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    // Usar la misma función que el botón rápido
    await quickConfirmPayment(selectedOrder);
  };

  const handleRejectPayment = async () => {
    if (!selectedOrder) return;

    setProcessingPayment(true);

    // TODO: Implementar servicio para rechazar pago
    // const result = await onlineOrderService.rejectPayment(selectedOrder.id);

    // Actualizar estado del pedido en localStorage
    const savedOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
    const updatedOrders = savedOrders.map((order) =>
      order.order_number === selectedOrder.order_number
        ? { ...order, status: 'rejected', rejected_at: new Date().toISOString() }
        : order
    );

    // Remover pedido rechazado de la lista de pendientes
    const remainingOrders = updatedOrders.filter(
      (order) => order.status !== 'rejected'
    );

    localStorage.setItem('pendingPaymentOrders', JSON.stringify(remainingOrders));

    setTimeout(() => {
      toast({
        title: 'Pago rechazado',
        description: `El pedido ${selectedOrder.order_number} ha sido rechazado`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      // Recargar pedidos pendientes
      loadPendingOrders();
      setProcessingPayment(false);
      closeOrderModal();
    }, 1500);
  };

  const getPaymentMethodBadge = (method) => {
    const methods = {
      qr: { label: 'QR', color: 'blue' },
      paypal: { label: 'PayPal', color: 'purple' },
      stripe: { label: 'Stripe', color: 'green' },
    };

    const methodData = methods[method] || { label: method, color: 'gray' };

    return (
      <Badge colorScheme={methodData.color} fontSize="sm">
        {methodData.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Flex direction="column" pt={{ base: '120px', md: '75px' }}>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color={textColor}>Cargando pedidos pendientes...</Text>
          </VStack>
        </Center>
      </Flex>
    );
  }

  return (
    <Flex direction="column" pt={{ base: '120px', md: '75px' }}>
      <Card>
        <CardHeader p="12px 5px" mb="12px">
          <Flex justify="space-between" align="center">
            <Text fontSize="xl" color={textColor} fontWeight="bold">
              Confirmar Pagos de Pedidos Online
            </Text>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={loadPendingOrders}
              isLoading={loading}
            >
              Actualizar
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          {pendingOrders.length === 0 ? (
            <Box p={6} bg="green.50" borderRadius="md" textAlign="center">
              <Text color="green.700" fontSize="lg" fontWeight="bold" mb={2}>
                ✅ No hay pedidos pendientes de confirmación
              </Text>
              <Text color="green.600" fontSize="sm">
                Todos los pagos han sido procesados
              </Text>
            </Box>
          ) : (
            <>
              <Alert status="info" mb={4} borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Tienes {pendingOrders.length} pedido(s) pendiente(s) de validación de pago
                </AlertDescription>
              </Alert>

              <Box overflowX="auto">
                <Table variant="simple" size="sm" color={textColor}>
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor}>N° Pedido</Th>
                      <Th borderColor={borderColor}>Fecha</Th>
                      <Th borderColor={borderColor}>Cliente</Th>
                      <Th borderColor={borderColor}>Teléfono</Th>
                      <Th borderColor={borderColor}>Método de Pago</Th>
                      <Th borderColor={borderColor}>Total (Bs.)</Th>
                      <Th borderColor={borderColor}>Acción</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingOrders.map((order) => (
                      <Tr key={order.saleId || order.order_number} _hover={{ bg: 'gray.50' }}>
                        <Td borderColor={borderColor} fontWeight="bold">
                          {order.order_number}
                        </Td>
                        <Td borderColor={borderColor} fontSize="xs">
                          {formatDate(order.created_at)}
                        </Td>
                        <Td borderColor={borderColor}>{order.customer_name}</Td>
                        <Td borderColor={borderColor}>{order.customer_phone}</Td>
                        <Td borderColor={borderColor}>
                          {getPaymentMethodBadge(order.payment_method)}
                        </Td>
                        <Td borderColor={borderColor} fontWeight="semibold" color="blue.500">
                          Bs. {parseFloat(order.total).toFixed(2)}
                        </Td>
                        <Td borderColor={borderColor}>
                          <HStack spacing={2}>
                            <Button
                              colorScheme="green"
                              size="sm"
                              onClick={() => quickConfirmPayment(order)}
                              isLoading={processingPayment}
                            >
                              ✓ Confirmar
                            </Button>
                            <Button
                              colorScheme="red"
                              size="sm"
                              variant="outline"
                              onClick={() => quickRejectPayment(order)}
                              isLoading={processingPayment}
                            >
                              ✗ Rechazar
                            </Button>
                            <Button
                              colorScheme="blue"
                              size="sm"
                              variant="ghost"
                              onClick={() => openOrderModal(order)}
                            >
                              👁️ Ver
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}
        </CardBody>
      </Card>

      {/* Modal de Confirmación de Pago */}
      <Modal isOpen={isModalOpen} onClose={closeOrderModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Validar Pago - Pedido {selectedOrder?.order_number}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={4} align="stretch">
                {/* Información del Cliente */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Información del Cliente
                  </Text>
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Text fontSize="sm" fontWeight="semibold">Nombre:</Text>
                      <Text fontSize="sm">{selectedOrder.customer_name}</Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" fontWeight="semibold">Email:</Text>
                      <Text fontSize="sm">{selectedOrder.customer_email}</Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" fontWeight="semibold">Teléfono:</Text>
                      <Text fontSize="sm">{selectedOrder.customer_phone}</Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" fontWeight="semibold">Dirección:</Text>
                      <Text fontSize="sm">{selectedOrder.delivery_address}</Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Método de Pago */}
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Método de Pago
                  </Text>
                  <HStack>
                    {getPaymentMethodBadge(selectedOrder.payment_method)}
                    <Text fontSize="sm" color="gray.600">
                      {selectedOrder.payment_method === 'qr' && 'Código QR'}
                      {selectedOrder.payment_method === 'paypal' && 'PayPal Digital'}
                      {selectedOrder.payment_method === 'stripe' && 'Tarjeta vía Stripe'}
                    </Text>
                  </HStack>
                </Box>

                {/* Comprobante de Pago (si existe) */}
                {(selectedOrder.paymentDetails?.paymentProof || selectedOrder.payment_proof) && (
                  <Box p={4} bg="green.50" borderRadius="md" borderWidth="2px" borderColor="green.200">
                    <Text fontSize="sm" fontWeight="bold" mb={3} color="green.700">
                      📸 Comprobante de Pago Adjunto
                    </Text>
                    <Box
                      borderRadius="md"
                      overflow="hidden"
                      border="2px solid"
                      borderColor="green.300"
                      bg="white"
                    >
                      <img
                        src={selectedOrder.payment_proof || selectedOrder.paymentDetails?.paymentProof}
                        alt="Comprobante de pago"
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                      />
                    </Box>
                    <Text fontSize="xs" color="gray.600" mt={2} textAlign="center">
                      Haz clic para ver en tamaño completo
                    </Text>
                  </Box>
                )}

                <Divider />

                {/* Detalle de Productos */}
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Detalle del Pedido
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {selectedOrder.items.map((item, idx) => (
                      <HStack key={idx} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm">
                          {item.product_name} x {item.quantity}
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          Bs. {(item.unit_price * item.quantity).toFixed(2)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Total */}
                <HStack justify="space-between" p={4} bg="green.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold">
                    Total a Pagar
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    Bs. {parseFloat(selectedOrder.total).toFixed(2)}
                  </Text>
                </HStack>

                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    Verifique que el cliente haya realizado el pago antes de confirmar
                  </AlertDescription>
                </Alert>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3} w="full">
              <Button
                leftIcon={<CloseIcon />}
                colorScheme="red"
                variant="outline"
                onClick={handleRejectPayment}
                isLoading={processingPayment}
                flex={1}
              >
                Rechazar Pago
              </Button>
              <Button
                leftIcon={<CheckIcon />}
                colorScheme="green"
                onClick={handleConfirmPayment}
                isLoading={processingPayment}
                flex={1}
              >
                Confirmar Pago
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default ConfirmPayment;
