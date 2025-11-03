import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Badge,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  VStack,
  HStack,
  Icon,
  IconButton,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/react";
import { CheckIcon, TimeIcon, RepeatIcon, ViewIcon } from "@chakra-ui/icons";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import { useAuth } from "contexts/AuthContext";
import api from "services/api";

function OnlineOrders() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();
  const { user } = useAuth();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  // Modal de detalles
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadOnlineSales();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      loadOnlineSales(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadOnlineSales = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      // Obtener todas las ventas
      const response = await api.get('/sales');
      const allSales = response.data;

      // Filtrar solo ventas online sin created_by_id (ventas online)
      // y verificar si ya tienen pedido asociado
      const ordersResponse = await api.get('/orders');
      const allOrders = ordersResponse.data;

      const onlineSales = allSales.filter(sale => {
        // Es venta online si no tiene created_by_id
        const isOnline = !sale.created_by_id;
        // Verificar si ya tiene pedido
        const hasOrder = allOrders.some(order => order.saleId === sale.id);
        // Mostrar solo las que son online Y no tienen pedido todavía
        return isOnline && !hasOrder;
      });

      setSales(onlineSales);
    } catch (error) {
      console.error('Error al cargar ventas online:', error);
      if (!silent) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error al cargar ventas online",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    }

    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    loadOnlineSales();
  };

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const handleConfirmPayment = async (saleId) => {
    setConfirmingId(saleId);

    try {
      // Llamar al endpoint de confirmación
      await api.patch(`/sales/${saleId}/confirm-online`);

      toast({
        title: "Pago confirmado",
        description: "El pedido ha sido creado y aparecerá en Pedidos Activos",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      // Recargar la lista
      loadOnlineSales();

      // Cerrar modal si está abierto
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al confirmar el pago",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }

    setConfirmingId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card>
          <CardBody>
            <Center h="400px">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text color={textColor}>Cargando ventas online...</Text>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card>
        <CardHeader p="12px 5px" mb="12px">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Ventas Online Pendientes de Confirmación
              </Text>
              <Text fontSize="sm" color="gray.500">
                Confirma el pago para crear el pedido en cocina
              </Text>
            </VStack>
            <HStack spacing={2}>
              {refreshing && <Spinner size="sm" color="blue.500" />}
              <Tooltip label="Actualizar">
                <IconButton
                  icon={<RepeatIcon />}
                  onClick={handleRefresh}
                  isLoading={refreshing}
                  colorScheme="blue"
                  variant="ghost"
                  aria-label="Actualizar"
                />
              </Tooltip>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody px="5px">
          {sales.length === 0 ? (
            <Center h="400px">
              <VStack spacing={4}>
                <Icon as={TimeIcon} w={12} h={12} color="gray.400" />
                <Text color="gray.500" fontSize="lg">
                  No hay ventas online pendientes de confirmación
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Las nuevas ventas aparecerán automáticamente aquí
                </Text>
              </VStack>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" color={textColor}>
                <Thead>
                  <Tr>
                    <Th>Número de Venta</Th>
                    <Th>Cliente</Th>
                    <Th>Fecha/Hora</Th>
                    <Th>Método de Pago</Th>
                    <Th>Total</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sales.map((sale) => (
                    <Tr key={sale.id}>
                      <Td>
                        <Text fontWeight="bold">{sale.sale_number}</Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{sale.customer_name || 'Cliente'}</Text>
                          <Text fontSize="xs" color="gray.500">{sale.customer_nit}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{formatDate(sale.created_at)}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue">{sale.payment_method.toUpperCase()}</Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="bold">Bs. {parseFloat(sale.total).toFixed(2)}</Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Ver detalles">
                            <IconButton
                              icon={<ViewIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => handleViewDetails(sale)}
                              aria-label="Ver detalles"
                            />
                          </Tooltip>
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<CheckIcon />}
                            onClick={() => handleConfirmPayment(sale.id)}
                            isLoading={confirmingId === sale.id}
                            loadingText="Confirmando..."
                          >
                            Confirmar Pago
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Modal de detalles */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Detalles de la Venta {selectedSale?.sale_number}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSale && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>Información del Cliente:</Text>
                  <Text>Nombre: {selectedSale.customer_name || 'N/A'}</Text>
                  <Text>NIT/CI: {selectedSale.customer_nit || 'N/A'}</Text>
                  {selectedSale.notes && (
                    <Text mt={2} fontSize="sm" color="gray.600">
                      Notas: {selectedSale.notes}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>Productos:</Text>
                  <VStack align="stretch" spacing={2}>
                    {selectedSale.details?.map((detail, index) => (
                      <Flex key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <Text>{detail.quantity}x {detail.custom_name || detail.product?.name}</Text>
                        <Text fontWeight="bold">Bs. {parseFloat(detail.subtotal).toFixed(2)}</Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                <Box borderTop="1px" borderColor={borderColor} pt={3}>
                  <Flex justify="space-between" mb={2}>
                    <Text>Subtotal:</Text>
                    <Text>Bs. {parseFloat(selectedSale.subtotal).toFixed(2)}</Text>
                  </Flex>
                  {selectedSale.discount > 0 && (
                    <Flex justify="space-between" mb={2}>
                      <Text>Descuento:</Text>
                      <Text color="red.500">- Bs. {parseFloat(selectedSale.discount).toFixed(2)}</Text>
                    </Flex>
                  )}
                  <Flex justify="space-between" fontWeight="bold" fontSize="lg">
                    <Text>Total:</Text>
                    <Text color="green.500">Bs. {parseFloat(selectedSale.total).toFixed(2)}</Text>
                  </Flex>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>Método de Pago:</Text>
                  <Badge colorScheme="blue" fontSize="md" p={2}>
                    {selectedSale.payment_method.toUpperCase()}
                  </Badge>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsDetailModalOpen(false)}>
              Cerrar
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<CheckIcon />}
              onClick={() => handleConfirmPayment(selectedSale.id)}
              isLoading={confirmingId === selectedSale.id}
            >
              Confirmar Pago y Crear Pedido
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default OnlineOrders;
