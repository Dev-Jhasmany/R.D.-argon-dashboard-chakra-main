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
  Divider,
  SimpleGrid,
  Icon,
  IconButton,
  Tooltip,
  keyframes,
} from "@chakra-ui/react";
import { CheckIcon, TimeIcon, RepeatIcon } from "@chakra-ui/icons";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import orderService from "services/orderService";
import api from "services/api";
import { useAuth } from "contexts/AuthContext";

// Animación de pulso para alertas urgentes
const pulse = keyframes`
  0% {
    boxShadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }
  70% {
    boxShadow: 0 0 0 10px rgba(255, 0, 0, 0);
  }
  100% {
    boxShadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
`;

function OrdersList() {
  const textColor = useColorModeValue("gray.700", "white");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOrdersSafe = async (silent = false) => {
      if (!isMounted) return;
      await loadOrders(silent);
    };

    loadOrdersSafe();

    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      loadOrdersSafe(true);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      // Cargar pedidos activos y ventas del backend
      const result = await orderService.getActiveOrders();

      if (result.success) {
        // Cargar ventas para enriquecer la información de pedidos online
        const salesResponse = await api.get('/sales');
        const allSales = salesResponse.data;

        // Enriquecer pedidos con información de la venta si existe
        const enrichedOrders = result.data.map(order => {
          // Buscar la venta asociada
          const sale = allSales.find(s => s.id === order.saleId);

          if (sale && !sale.created_by_id) {
            // Es un pedido online (venta sin created_by_id)
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
              ...order,
              order_type: 'online',
              delivery_type: sale.order_type || orderType,
              delivery_time: sale.delivery_time || (timeMatch ? timeMatch[1] : null),
              customer_name: sale.customer_name || 'Cliente Online',
              customer_phone: sale.customer_nit || 'N/A',
              customer_email: emailMatch ? emailMatch[1] : null,
              delivery_address: sale.delivery_address || (addressMatch ? addressMatch[1].trim() : 'N/A'),
              payment_method: sale.payment_method || 'N/A',
              total: sale.total,
              items: sale.details?.map(d => ({
                product_name: d.custom_name || d.product?.name,
                quantity: d.quantity,
                unit_price: d.unit_price,
                subtotal: d.subtotal,
              })) || [],
            };
          }

          return order;
        });

        // Ordenar por fecha (más recientes primero - arriba)
        const sortedOrders = enrichedOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA; // Más reciente primero
        });

        setOrders(sortedOrders);
      } else {
        setOrders([]);

        if (!silent) {
          toast({
            title: "Error",
            description: result.error,
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setOrders([]);

      if (!silent) {
        toast({
          title: "Error",
          description: "Error al cargar pedidos",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReceive = async (orderId) => {
    // Validar que el usuario esté cargado
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar el usuario. Por favor, recarga la página.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const result = await orderService.markAsReceived(orderId, user.id);

    if (result.success) {
      toast({
        title: "Pedido recepcionado",
        description: "El pedido ha sido marcado como recepcionado",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadOrders();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleComplete = async (orderId) => {
    const result = await orderService.markAsCompleted(orderId);

    if (result.success) {
      toast({
        title: "Pedido concluido",
        description: "El pedido ha sido marcado como concluido",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadOrders();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleCancel = async (orderId) => {
    const result = await orderService.cancelOrder(orderId);

    if (result.success) {
      toast({
        title: "Pedido cancelado",
        description: "El pedido ha sido cancelado exitosamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadOrders();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Pendiente", color: "orange" },
      received: { label: "Recepcionado", color: "blue" },
      in_progress: { label: "En Preparación", color: "purple" },
      completed: { label: "Concluido", color: "green" },
      delivered: { label: "Entregado", color: "teal" },
      cancelled: { label: "Cancelado", color: "red" },
    };

    const config = statusConfig[status] || { label: status, color: "gray" };

    return (
      <Badge colorScheme={config.color} fontSize="sm" p="4px 12px" borderRadius="md">
        {config.label}
      </Badge>
    );
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Calcula la hora de inicio de preparación
   * Resta el tiempo de preparación estimado de la hora de entrega
   */
  const calculateStartTime = (deliveryTime, estimatedMinutes) => {
    if (!deliveryTime || !estimatedMinutes) return null;

    try {
      // Crear fecha de hoy con la hora de entrega
      const today = new Date();
      const [hours, minutes] = deliveryTime.split(':');
      const deliveryDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));

      // Restar el tiempo de preparación
      const startDate = new Date(deliveryDate.getTime() - estimatedMinutes * 60000);

      return startDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error calculando hora de inicio:', error);
      return null;
    }
  };

  /**
   * Calcula cuántos minutos faltan para empezar a preparar
   */
  const getMinutesUntilStart = (deliveryTime, estimatedMinutes) => {
    if (!deliveryTime || !estimatedMinutes) return null;

    try {
      const now = new Date();
      const today = new Date();
      const [hours, minutes] = deliveryTime.split(':');
      const deliveryDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));

      // Hora de inicio de preparación
      const startDate = new Date(deliveryDate.getTime() - estimatedMinutes * 60000);

      // Diferencia en minutos
      const diffMinutes = Math.floor((startDate - now) / 60000);

      return diffMinutes;
    } catch (error) {
      console.error('Error calculando minutos restantes:', error);
      return null;
    }
  };

  /**
   * Obtiene el badge de urgencia según minutos restantes
   */
  const getUrgencyBadge = (minutesUntilStart) => {
    if (minutesUntilStart === null) return null;

    if (minutesUntilStart <= 0) {
      return { label: '🚨 PREPARAR AHORA', color: 'red', pulse: true };
    } else if (minutesUntilStart <= 5) {
      return { label: `⚠️ Preparar en ${minutesUntilStart} min`, color: 'orange', pulse: true };
    } else if (minutesUntilStart <= 15) {
      return { label: `⏰ Preparar en ${minutesUntilStart} min`, color: 'yellow', pulse: false };
    } else {
      return { label: `✓ Preparar en ${minutesUntilStart} min`, color: 'green', pulse: false };
    }
  };

  /**
   * Obtiene el label del tipo de pedido
   */
  const getDeliveryTypeLabel = (type) => {
    const labels = {
      'pickup': '🏃 Para llevar',
      'delivery': '🛵 Delivery',
      'dine-in': '🍽️ En el local'
    };
    return labels[type] || type;
  };

  /**
   * Verifica si ya es hora de recepcionar el pedido
   * Retorna true si ya llegó o pasó la hora de inicio de preparación
   */
  const canReceiveOrder = (deliveryTime, estimatedMinutes) => {
    if (!deliveryTime || !estimatedMinutes) {
      // Si no hay hora de entrega, siempre permitir recepcionar
      return true;
    }

    try {
      const now = new Date();
      const today = new Date();
      const [hours, minutes] = deliveryTime.split(':');
      const deliveryDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));

      // Hora de inicio de preparación
      const startDate = new Date(deliveryDate.getTime() - estimatedMinutes * 60000);

      // Permitir recepcionar si ya pasó o es la hora de inicio
      return now >= startDate;
    } catch (error) {
      console.error('Error verificando hora de recepción:', error);
      return true; // En caso de error, permitir recepcionar
    }
  };

  if (loading) {
    return (
      <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.300" />
        </Center>
      </Flex>
    );
  }

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Flex justify='space-between' align='center'>
            <Box>
              <Text fontSize='xl' color={textColor} fontWeight='bold'>
                Pedidos Activos
              </Text>
              <Text fontSize='sm' color='gray.500' mt={1}>
                Lista de pedidos pendientes, recepcionados y en preparación
              </Text>
            </Box>
            <HStack spacing={3}>
              <Badge colorScheme='blue' p='6px 12px' borderRadius='8px' fontSize="md">
                {orders.length} pedidos
              </Badge>
              <Tooltip label="Actualizar">
                <IconButton
                  icon={<RepeatIcon />}
                  size="sm"
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => loadOrders()}
                  isLoading={refreshing}
                />
              </Tooltip>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          {orders.length === 0 ? (
            <Center h="200px">
              <VStack>
                <Icon as={CheckIcon} w={10} h={10} color="green.300" />
                <Text fontSize="lg" color="gray.500">
                  No hay pedidos activos
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Todos los pedidos han sido atendidos
                </Text>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {orders.map((order) => (
                <Card
                  key={order.id}
                  bg={bgColor}
                  borderWidth="2px"
                  borderColor={borderColor}
                  _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      {/* Header del pedido */}
                      <Flex justify="space-between" align="center">
                        <Box>
                          <HStack spacing={2}>
                            <Text fontSize="lg" fontWeight="bold" color={textColor}>
                              {order.orderNumber || order.order_number}
                            </Text>
                            {order.order_type === 'online' && (
                              <Badge colorScheme="cyan" fontSize="xs" px={2} py={1}>
                                🌐 ONLINE
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(order.createdAt || order.created_at)} - {formatTime(order.createdAt || order.created_at)}
                          </Text>
                        </Box>
                        {getStatusBadge(order.status)}
                      </Flex>

                      {/* Información del cliente para pedidos online */}
                      {order.order_type === 'online' && (
                        <>
                          <Box p={3} bg="cyan.50" borderRadius="md" borderWidth="1px" borderColor="cyan.200">
                            <VStack align="stretch" spacing={1}>
                              <Text fontSize="xs" fontWeight="bold" color="cyan.700">
                                📦 Pedido Online
                              </Text>
                              <Text fontSize="xs" color="gray.700">
                                👤 {order.customer_name}
                              </Text>
                              <Text fontSize="xs" color="gray.700">
                                📞 {order.customer_phone}
                              </Text>
                              <Text fontSize="xs" color="gray.700">
                                📍 {order.delivery_address}
                              </Text>
                              <Text fontSize="xs" color="gray.700">
                                💳 {order.payment_method?.toUpperCase()}
                              </Text>
                            </VStack>
                          </Box>

                          {/* Tipo de pedido y hora de entrega */}
                          {(order.delivery_type || order.delivery_time) && (
                            <Box p={3} bg="purple.50" borderRadius="md" borderWidth="2px" borderColor="purple.300">
                              <VStack align="stretch" spacing={2}>
                                {order.delivery_type && (
                                  <HStack justify="space-between">
                                    <Text fontSize="xs" fontWeight="bold" color="purple.700">
                                      Tipo de Pedido:
                                    </Text>
                                    <Badge colorScheme="purple" fontSize="xs" px={2} py={1}>
                                      {getDeliveryTypeLabel(order.delivery_type)}
                                    </Badge>
                                  </HStack>
                                )}
                                {order.delivery_time && (
                                  <>
                                    <HStack justify="space-between">
                                      <Text fontSize="xs" fontWeight="bold" color="purple.700">
                                        Hora de Entrega:
                                      </Text>
                                      <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
                                        🕐 {order.delivery_time}
                                      </Badge>
                                    </HStack>
                                    {order.estimatedPreparationTime && calculateStartTime(order.delivery_time, order.estimatedPreparationTime) && (
                                      <>
                                        <HStack justify="space-between">
                                          <Text fontSize="xs" fontWeight="bold" color="purple.700">
                                            Iniciar Preparación:
                                          </Text>
                                          <Badge colorScheme="teal" fontSize="sm" px={2} py={1}>
                                            🍳 {calculateStartTime(order.delivery_time, order.estimatedPreparationTime)}
                                          </Badge>
                                        </HStack>
                                        {(() => {
                                          const minutesUntilStart = getMinutesUntilStart(order.delivery_time, order.estimatedPreparationTime);
                                          const urgency = getUrgencyBadge(minutesUntilStart);
                                          return urgency && (
                                            <Box
                                              p={2}
                                              bg={`${urgency.color}.100`}
                                              borderRadius="md"
                                              borderWidth="2px"
                                              borderColor={`${urgency.color}.400`}
                                              animation={urgency.pulse ? `${pulse} 2s infinite` : 'none'}
                                            >
                                              <Text fontSize="sm" fontWeight="bold" color={`${urgency.color}.700`} textAlign="center">
                                                {urgency.label}
                                              </Text>
                                            </Box>
                                          );
                                        })()}
                                      </>
                                    )}
                                  </>
                                )}
                              </VStack>
                            </Box>
                          )}
                        </>
                      )}

                      <Divider />

                      {/* Información del vendedor */}
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Vendedor
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {order.seller ? `${order.seller.full_name} ${order.seller.full_last_name}`.trim() : 'N/A'}
                        </Text>
                      </Box>

                      {/* Detalles del pedido - PRODUCTOS A PREPARAR */}
                      <Box bg="orange.50" p={3} borderRadius="md" borderWidth="2px" borderColor="orange.300">
                        <Text fontSize="sm" color="orange.700" fontWeight="bold" mb={2}>
                          🍽️ PRODUCTOS A PREPARAR
                        </Text>
                        <VStack align="stretch" spacing={2}>
                          {/* Pedidos normales usan 'details', pedidos online usan 'items' */}
                          {(order.details || order.items)?.map((detail, idx) => (
                            <Box
                              key={idx}
                              bg="white"
                              p={2}
                              borderRadius="md"
                              borderWidth="1px"
                              borderColor="orange.200"
                            >
                              <Flex justify="space-between" align="center">
                                <HStack spacing={2}>
                                  <Badge colorScheme="orange" fontSize="md" p={2}>
                                    {detail.quantity}x
                                  </Badge>
                                  <Text fontSize="md" fontWeight="bold" color="gray.700">
                                    {detail.name || detail.product_name}
                                  </Text>
                                </HStack>
                                {detail.preparationTime && (
                                  <Badge colorScheme="purple" fontSize="xs">
                                    {detail.preparationTime}min
                                  </Badge>
                                )}
                              </Flex>
                              {order.order_type === 'online' && detail.unit_price && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                  Precio: Bs. {(detail.unit_price * detail.quantity).toFixed(2)}
                                </Text>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      </Box>

                      {/* Total para pedidos online */}
                      {order.order_type === 'online' && order.total && (
                        <Flex justify="space-between" p={2} bg="blue.50" borderRadius="md">
                          <Text fontSize="sm" fontWeight="bold" color="blue.700">
                            Total
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="blue.600">
                            Bs. {parseFloat(order.total).toFixed(2)}
                          </Text>
                        </Flex>
                      )}

                      {/* Tiempo estimado */}
                      {order.estimatedPreparationTime && (
                        <Flex align="center" gap={2} p={2} bg="purple.50" borderRadius="md">
                          <Icon as={TimeIcon} color="purple.500" />
                          <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                            Tiempo estimado: {order.estimatedPreparationTime} minutos
                          </Text>
                        </Flex>
                      )}

                      {/* Notas */}
                      {order.notes && (
                        <Box p={2} bg="gray.50" borderRadius="md">
                          <Text fontSize="xs" color="gray.600" fontStyle="italic">
                            "{order.notes}"
                          </Text>
                        </Box>
                      )}

                      <Divider />

                      {/* Acciones */}
                      <VStack spacing={2}>
                        {order.status === 'pending' && (() => {
                          const canReceive = canReceiveOrder(order.delivery_time, order.estimatedPreparationTime);
                          const minutesUntilStart = getMinutesUntilStart(order.delivery_time, order.estimatedPreparationTime);
                          const startTime = calculateStartTime(order.delivery_time, order.estimatedPreparationTime);

                          let tooltipLabel = '';
                          if (!user || !user.id) {
                            tooltipLabel = 'Debes iniciar sesión para recepcionar pedidos';
                          } else if (!canReceive && startTime) {
                            tooltipLabel = `Este pedido se puede recepcionar a las ${startTime} (en ${minutesUntilStart} minutos)`;
                          } else if (canReceive) {
                            tooltipLabel = 'Haz click para recepcionar este pedido';
                          }

                          return (
                            <>
                              <Tooltip
                                label={tooltipLabel}
                                placement="top"
                                hasArrow
                              >
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  width="full"
                                  onClick={() => handleReceive(order.id)}
                                  isDisabled={!user || !user.id || !canReceive}
                                  opacity={!canReceive ? 0.5 : 1}
                                >
                                  {!canReceive ? '🔒 Recepcionar Pedido' : 'Recepcionar Pedido'}
                                </Button>
                              </Tooltip>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                width="full"
                                onClick={() => handleCancel(order.id)}
                              >
                                Cancelar Pedido
                              </Button>
                            </>
                          );
                        })()}

                        {(order.status === 'received' || order.status === 'in_progress') && (
                          <>
                            <Button
                              size="sm"
                              colorScheme="green"
                              width="full"
                              onClick={() => handleComplete(order.id)}
                            >
                              Marcar como Concluido
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              width="full"
                              onClick={() => handleCancel(order.id)}
                            >
                              Cancelar Pedido
                            </Button>
                          </>
                        )}

                        {order.receivedAt && (
                          <Text fontSize="xs" color="gray.500">
                            Recepcionado: {formatTime(order.receivedAt)}
                          </Text>
                        )}
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </CardBody>
      </Card>
    </Flex>
  );
}

export default OrdersList;
