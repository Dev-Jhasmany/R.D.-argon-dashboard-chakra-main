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
  Input,
  FormControl,
  FormLabel,
  Textarea,
  IconButton,
  Select,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import api from 'services/api';

function ConfirmPayment() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const modalBg = useColorModeValue('gray.50', 'gray.700');
  const itemBg = useColorModeValue('gray.50', 'gray.600');
  const infoBg = useColorModeValue('blue.50', 'blue.900');
  const successBg = useColorModeValue('green.50', 'green.900');
  const toast = useToast();

  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editedCustomerData, setEditedCustomerData] = useState({
    customer_name: '',
    customer_email: '',
    customer_nit: '',
    delivery_address: '',
    order_type: 'pickup',
    delivery_time: '12:00'
  });

  useEffect(() => {
    loadPendingOrders();

    // Actualizar cada 5 segundos para detectar nuevos pedidos
    // SOLO si no hay modales abiertos
    const intervalId = setInterval(() => {
      // No actualizar si el modal de validación o el modal de imagen están abiertos
      if (!isModalOpen && !isImageModalOpen) {
        loadPendingOrders();
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isModalOpen, isImageModalOpen]);

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
          const typeMatch = notes.match(/Tipo:\s*([^-]+)/);
          const timeMatch = notes.match(/Entrega programada:\s*(\d{2}:\d{2})/);

          // Mapear el tipo de pedido
          const orderTypeMap = {
            'Para llevar': 'pickup',
            'Delivery': 'delivery',
            'En el local': 'dine-in'
          };
          const orderTypeText = typeMatch ? typeMatch[1].trim() : 'Para llevar';
          const orderType = orderTypeMap[orderTypeText] || 'pickup';

          return {
            // Mapear al formato que espera el componente
            order_number: sale.sale_number,
            saleId: sale.id, // Guardar el ID real de la venta
            customer_name: sale.customer_name,
            customer_email: emailMatch ? emailMatch[1] : null,
            customer_phone: sale.customer_nit, // Usamos nit como teléfono
            delivery_address: sale.delivery_address || (addressMatch ? addressMatch[1].trim() : null),
            order_type: sale.order_type || orderType,
            delivery_time: sale.delivery_time || (timeMatch ? timeMatch[1] : '12:00'),
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
    // Inicializar datos para edición
    setEditedCustomerData({
      customer_name: order.customer_name || '',
      customer_email: order.customer_email || '',
      customer_nit: order.customer_phone || '',
      delivery_address: order.delivery_address || '',
      order_type: order.order_type || 'pickup',
      delivery_time: order.delivery_time || '12:00'
    });
    setIsEditingCustomer(false);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setIsEditingCustomer(false);
  };

  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleSaveCustomerInfo = async () => {
    if (!selectedOrder) return;

    setProcessingPayment(true);

    try {
      // Actualizar información del cliente en el backend
      await api.patch(`/sales/${selectedOrder.saleId}/customer-info`, {
        customer_name: editedCustomerData.customer_name,
        customer_email: editedCustomerData.customer_email,
        customer_nit: editedCustomerData.customer_nit,
        delivery_address: editedCustomerData.delivery_address,
        order_type: editedCustomerData.order_type,
        delivery_time: editedCustomerData.delivery_time
      });

      // Actualizar el pedido en el estado local
      setSelectedOrder({
        ...selectedOrder,
        customer_name: editedCustomerData.customer_name,
        customer_email: editedCustomerData.customer_email,
        customer_phone: editedCustomerData.customer_nit,
        delivery_address: editedCustomerData.delivery_address,
        order_type: editedCustomerData.order_type,
        delivery_time: editedCustomerData.delivery_time
      });

      // Actualizar la lista de pedidos pendientes
      setPendingOrders(prevOrders =>
        prevOrders.map(order =>
          order.saleId === selectedOrder.saleId
            ? {
                ...order,
                customer_name: editedCustomerData.customer_name,
                customer_email: editedCustomerData.customer_email,
                customer_phone: editedCustomerData.customer_nit,
                delivery_address: editedCustomerData.delivery_address,
                order_type: editedCustomerData.order_type,
                delivery_time: editedCustomerData.delivery_time
              }
            : order
        )
      );

      setIsEditingCustomer(false);

      toast({
        title: 'Datos actualizados',
        description: 'La información del cliente ha sido actualizada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error al actualizar información del cliente:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información del cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setProcessingPayment(false);
    }
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
            <Box p={6} bg={successBg} borderRadius="md" textAlign="center">
              <Text color={useColorModeValue("green.700", "green.200")} fontSize="lg" fontWeight="bold" mb={2}>
                ✅ No hay pedidos pendientes de confirmación
              </Text>
              <Text color={useColorModeValue("green.600", "green.300")} fontSize="sm">
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
                      <Tr key={order.saleId || order.order_number} _hover={{ bg: hoverBg }}>
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
                <Box p={4} bg={modalBg} borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="bold">
                      Información del Cliente
                    </Text>
                    {!isEditingCustomer && (
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => setIsEditingCustomer(true)}
                        aria-label="Editar información del cliente"
                      />
                    )}
                  </HStack>

                  {isEditingCustomer ? (
                    <VStack align="stretch" spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="sm">Nombre</FormLabel>
                        <Input
                          size="sm"
                          value={editedCustomerData.customer_name}
                          onChange={(e) => setEditedCustomerData({
                            ...editedCustomerData,
                            customer_name: e.target.value
                          })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Email</FormLabel>
                        <Input
                          size="sm"
                          type="email"
                          value={editedCustomerData.customer_email}
                          onChange={(e) => setEditedCustomerData({
                            ...editedCustomerData,
                            customer_email: e.target.value
                          })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Teléfono</FormLabel>
                        <Input
                          size="sm"
                          value={editedCustomerData.customer_nit}
                          onChange={(e) => setEditedCustomerData({
                            ...editedCustomerData,
                            customer_nit: e.target.value
                          })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Dirección</FormLabel>
                        <Textarea
                          size="sm"
                          rows={2}
                          value={editedCustomerData.delivery_address}
                          onChange={(e) => setEditedCustomerData({
                            ...editedCustomerData,
                            delivery_address: e.target.value
                          })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Tipo de Pedido</FormLabel>
                        <Select
                          size="sm"
                          value={editedCustomerData.order_type}
                          onChange={(e) => setEditedCustomerData({
                            ...editedCustomerData,
                            order_type: e.target.value
                          })}
                        >
                          <option value="pickup">Para llevar</option>
                          <option value="delivery">Delivery</option>
                          <option value="dine-in">En el local</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Hora de Entrega</FormLabel>
                        <Input
                          size="sm"
                          type="time"
                          value={editedCustomerData.delivery_time}
                          onChange={(e) => setEditedCustomerData({
                            ...editedCustomerData,
                            delivery_time: e.target.value
                          })}
                        />
                      </FormControl>
                      <HStack spacing={2} justify="flex-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsEditingCustomer(false);
                            setEditedCustomerData({
                              customer_name: selectedOrder.customer_name || '',
                              customer_email: selectedOrder.customer_email || '',
                              customer_nit: selectedOrder.customer_phone || '',
                              delivery_address: selectedOrder.delivery_address || '',
                              order_type: selectedOrder.order_type || 'pickup',
                              delivery_time: selectedOrder.delivery_time || '12:00'
                            });
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={handleSaveCustomerInfo}
                          isLoading={processingPayment}
                        >
                          Guardar
                        </Button>
                      </HStack>
                    </VStack>
                  ) : (
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
                        <Text fontSize="sm" fontWeight="semibold">Tipo de Pedido:</Text>
                        <Text fontSize="sm">
                          {selectedOrder.order_type === 'delivery' ? 'Delivery' :
                           selectedOrder.order_type === 'pickup' ? 'Para llevar' :
                           selectedOrder.order_type === 'dine-in' ? 'En el local' : 'Para llevar'}
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm" fontWeight="semibold">Hora de Entrega:</Text>
                        <Text fontSize="sm">{selectedOrder.delivery_time}</Text>
                      </HStack>
                      {selectedOrder.delivery_address && (
                        <HStack>
                          <Text fontSize="sm" fontWeight="semibold">Dirección:</Text>
                          <Text fontSize="sm">{selectedOrder.delivery_address}</Text>
                        </HStack>
                      )}
                    </VStack>
                  )}
                </Box>

                {/* Método de Pago */}
                <Box p={4} bg={infoBg} borderRadius="md">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Método de Pago
                  </Text>
                  <HStack>
                    {getPaymentMethodBadge(selectedOrder.payment_method)}
                    <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
                      {selectedOrder.payment_method === 'qr' && 'Código QR'}
                      {selectedOrder.payment_method === 'paypal' && 'PayPal Digital'}
                      {selectedOrder.payment_method === 'stripe' && 'Tarjeta vía Stripe'}
                    </Text>
                  </HStack>
                </Box>

                {/* Comprobante de Pago (si existe) */}
                {(selectedOrder.paymentDetails?.paymentProof || selectedOrder.payment_proof) && (
                  <Box p={4} bg={successBg} borderRadius="md" borderWidth="2px" borderColor="green.200">
                    <Text fontSize="sm" fontWeight="bold" mb={3} color={useColorModeValue("green.700", "green.200")}>
                      📸 Comprobante de Pago Adjunto
                    </Text>
                    <Box
                      borderRadius="md"
                      overflow="hidden"
                      border="2px solid"
                      borderColor="green.300"
                      bg={useColorModeValue("white", "gray.800")}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        transform: "scale(1.02)",
                        boxShadow: "lg",
                        borderColor: "green.500"
                      }}
                      onClick={() => openImageModal(selectedOrder.payment_proof || selectedOrder.paymentDetails?.paymentProof)}
                    >
                      <img
                        src={selectedOrder.payment_proof || selectedOrder.paymentDetails?.paymentProof}
                        alt="Comprobante de pago"
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                      />
                    </Box>
                    <Text fontSize="xs" color={useColorModeValue("gray.600", "gray.300")} mt={2} textAlign="center" fontWeight="medium">
                      🔍 Haz clic en la imagen para ver en tamaño completo
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
                      <HStack key={idx} justify="space-between" p={2} bg={itemBg} borderRadius="md">
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
                <HStack justify="space-between" p={4} bg={successBg} borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold">
                    Total a Pagar
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("green.600", "green.300")}>
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

      {/* Modal para ver la imagen en tamaño completo */}
      <Modal isOpen={isImageModalOpen} onClose={closeImageModal} size="full" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none" maxW="95vw" maxH="95vh">
          <ModalCloseButton
            color="white"
            bg="blackAlpha.600"
            _hover={{ bg: "blackAlpha.800" }}
            size="lg"
            zIndex={2}
          />
          <ModalBody display="flex" alignItems="center" justifyContent="center" p={0}>
            {selectedImage && (
              <Box
                maxW="100%"
                maxH="95vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <img
                  src={selectedImage}
                  alt="Comprobante de pago - Tamaño completo"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '95vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                  }}
                />
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default ConfirmPayment;
