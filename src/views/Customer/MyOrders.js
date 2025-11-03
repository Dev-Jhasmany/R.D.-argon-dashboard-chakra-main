import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Badge,
  Divider,
  SimpleGrid,
  Flex,
  Image,
} from "@chakra-ui/react";
import { FiPackage, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function MyOrders() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();

  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    // Actualizar cada 5 segundos para detectar cambios
    const intervalId = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const loadOrders = () => {
    setLoading(true);

    // Cargar pedidos de todos los estados
    const pendingOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
    const confirmedOrders = JSON.parse(localStorage.getItem('confirmedOrders') || '[]');

    // Combinar todos los pedidos
    const orders = [...pendingOrders, ...confirmedOrders];

    // Ordenar por fecha (más recientes primero)
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setAllOrders(orders);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_payment': { label: 'Pendiente de Pago', color: 'orange', icon: FiClock },
      'pending_confirmation': { label: 'En Validación', color: 'yellow', icon: FiClock },
      'confirmed': { label: 'Confirmado', color: 'green', icon: FiCheckCircle },
      'rejected': { label: 'Rechazado', color: 'red', icon: FiXCircle },
    };

    const config = statusConfig[status] || { label: status, color: 'gray', icon: FiPackage };

    return (
      <Badge colorScheme={config.color} fontSize="sm" px={2} py={1}>
        <HStack spacing={1}>
          <Icon as={config.icon} w={3} h={3} />
          <Text>{config.label}</Text>
        </HStack>
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methods = {
      qr: { label: 'QR', color: 'blue' },
      paypal: { label: 'PayPal', color: 'purple' },
      stripe: { label: 'Stripe', color: 'green' },
    };

    const methodData = methods[method] || { label: method, color: 'gray' };

    return (
      <Badge colorScheme={methodData.color} fontSize="xs">
        {methodData.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box pt={{ base: "80px", md: "100px" }} px={{ base: "15px", md: "30px" }} pb="30px" bg="transparent">
      <Box mb={8}>
        <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
          Mis Pedidos
        </Text>
        <Text color="white">
          Aquí encontrarás el historial de tus pedidos
        </Text>
      </Box>

      {allOrders.length === 0 ? (
        <Card>
          <CardBody>
            <VStack spacing={6} py={12}>
              <Icon as={FiPackage} w={20} h={20} color="gray.400" />
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                No tienes pedidos aún
              </Text>
              <Text color="gray.500" textAlign="center">
                Cuando realices un pedido, aparecerá aquí con toda su información
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => history.push("/customer/shop")}
              >
                Explorar productos
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {allOrders.map((order, index) => (
            <Card key={index}>
              <CardHeader p="12px 5px" mb="12px">
                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                  <HStack spacing={3}>
                    <Icon as={FiPackage} w={5} h={5} color="blue.500" />
                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                      {order.order_number}
                    </Text>
                  </HStack>
                  {getStatusBadge(order.status)}
                </Flex>
              </CardHeader>

              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Información del pedido */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Fecha
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {formatDate(order.created_at)}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Método de Pago
                      </Text>
                      {getPaymentMethodBadge(order.payment_method)}
                    </Box>

                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Dirección de Entrega
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {order.delivery_address}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Total
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="blue.500">
                        Bs. {parseFloat(order.total || 0).toFixed(2)}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <Divider />

                  {/* Productos */}
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color={textColor} mb={3}>
                      Productos ({order.items?.length || 0})
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {order.items?.map((item, idx) => (
                        <Flex
                          key={idx}
                          justify="space-between"
                          align="center"
                          p={2}
                          bg="gray.50"
                          borderRadius="md"
                        >
                          <HStack spacing={3} flex={1}>
                            <Text fontSize="sm" fontWeight="bold" color="blue.500">
                              {item.quantity}x
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              {item.product_name}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                            Bs. {(parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 0)).toFixed(2)}
                          </Text>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>

                  {/* Comprobante de pago si existe */}
                  {order.paymentDetails?.paymentProof && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color={textColor} mb={2}>
                          📸 Comprobante de Pago
                        </Text>
                        <Box
                          borderRadius="md"
                          overflow="hidden"
                          border="2px solid"
                          borderColor="green.300"
                          maxW="300px"
                        >
                          <Image
                            src={order.paymentDetails.paymentProof}
                            alt="Comprobante de pago"
                            objectFit="contain"
                            maxH="200px"
                          />
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* Fecha de confirmación si está confirmado */}
                  {order.status === 'confirmed' && order.confirmed_at && (
                    <Box p={3} bg="green.50" borderRadius="md">
                      <Text fontSize="xs" color="green.700">
                        ✓ Confirmado el {formatDate(order.confirmed_at)}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default MyOrders;
