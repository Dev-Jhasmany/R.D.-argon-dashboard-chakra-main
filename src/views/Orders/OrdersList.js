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
} from "@chakra-ui/react";
import { CheckIcon, TimeIcon, RepeatIcon } from "@chakra-ui/icons";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import orderService from "services/orderService";
import { useAuth } from "contexts/AuthContext";

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
    loadOrders();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      loadOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const result = await orderService.getActiveOrders();

    if (result.success) {
      setOrders(result.data);
    } else {
      if (!silent) {
        toast({
          title: "Error",
          description: result.error,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }

    setLoading(false);
    setRefreshing(false);
  };

  const handleReceive = async (orderId) => {
    const result = await orderService.markAsReceived(orderId, user.id);

    if (result.success) {
      toast({
        title: "Pedido recepcionado",
        description: "El pedido ha sido marcado como recepcionado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadOrders();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
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
      });
      loadOrders();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
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
                          <Text fontSize="lg" fontWeight="bold" color={textColor}>
                            {order.orderNumber}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(order.createdAt)} - {formatTime(order.createdAt)}
                          </Text>
                        </Box>
                        {getStatusBadge(order.status)}
                      </Flex>

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

                      {/* Detalles del pedido */}
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={2}>
                          Detalles del pedido
                        </Text>
                        <VStack align="stretch" spacing={1}>
                          {order.details?.map((detail, idx) => (
                            <Flex key={idx} justify="space-between" fontSize="sm">
                              <Text>
                                {detail.quantity}x {detail.name}
                              </Text>
                              {detail.preparationTime && (
                                <Badge colorScheme="purple" fontSize="xs">
                                  {detail.preparationTime}min
                                </Badge>
                              )}
                            </Flex>
                          ))}
                        </VStack>
                      </Box>

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
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            width="full"
                            onClick={() => handleReceive(order.id)}
                          >
                            Recepcionar Pedido
                          </Button>
                        )}

                        {(order.status === 'received' || order.status === 'in_progress') && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            width="full"
                            onClick={() => handleComplete(order.id)}
                          >
                            Marcar como Concluido
                          </Button>
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
