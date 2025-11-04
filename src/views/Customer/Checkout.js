import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  useColorModeValue,
  useToast,
  VStack,
  HStack,
  Divider,
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import publicApi from "services/publicApi";

function Checkout() {
  const textColor = useColorModeValue("gray.700", "white");
  const selectBg = useColorModeValue("white", "gray.700");
  const selectColor = useColorModeValue("gray.800", "white");
  const selectBorderColor = useColorModeValue("gray.300", "gray.600");
  const selectHoverBorderColor = useColorModeValue("gray.400", "gray.500");
  const timePickerBg = useColorModeValue("white", "gray.700");
  const timePickerBorderColor = useColorModeValue("gray.200", "gray.600");
  const timePickerDisplayBg = useColorModeValue("blue.50", "blue.900");
  const timePickerTextColor = useColorModeValue("gray.600", "gray.300");
  const timePickerInfoColor = useColorModeValue("gray.500", "gray.400");
  const toast = useToast();
  const history = useHistory();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduleDelivery, setScheduleDelivery] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    order_type: "para_llevar", // "en_el_local" o "para_llevar"
    payment_method: "qr",
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("customerCart") || "[]");
    if (savedCart.length === 0) {
      history.push("/customer/cart");
    }
    setCart(savedCart);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const validateForm = () => {
    if (!formData.customer_name.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingrese su nombre",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }

    if (!formData.customer_phone.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingrese su teléfono",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }

    if (!formData.order_type) {
      toast({
        title: "Campo requerido",
        description: "Por favor seleccione el tipo de pedido",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }

    if (scheduleDelivery && !scheduledTime.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor seleccione la hora de entrega programada",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Preparar datos de la venta para el backend
      const orderTypeLabel = formData.order_type === 'en_el_local' ? 'En el local' : 'Para llevar';
      const scheduledInfo = scheduleDelivery && scheduledTime
        ? ` - Entrega programada: ${scheduledTime}`
        : '';
      const saleData = {
        customer_name: formData.customer_name,
        customer_nit: formData.customer_phone, // Usamos el teléfono como NIT temporal
        payment_method: formData.payment_method,
        notes: `Pedido online - Tipo: ${orderTypeLabel}${formData.customer_email ? ` - Email: ${formData.customer_email}` : ''}${scheduledInfo}`,
        discount: 0,
        details: cart.map((item) => ({
          product_id: item._originalProductId || item.id, // Usar el ID original del producto
          quantity: item.quantity,
          unit_price: item.price,
        })),
      };

      console.log('📡 Enviando pedido al backend...', saleData);

      // Crear la venta en el backend (esto descontará el stock automáticamente)
      const response = await publicApi.post('/public/sales', saleData);

      console.log('✅ Pedido creado exitosamente:', response.data);

      // Guardar datos del pedido para OrderSuccess
      const orderData = {
        sale_id: response.data.id, // ID de la venta para actualizar comprobante
        order_number: response.data.sale_number,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        order_type: formData.order_type, // "en_el_local" o "para_llevar"
        payment_method: formData.payment_method,
        scheduled_delivery: scheduleDelivery,
        scheduled_time: scheduleDelivery && scheduledTime ? scheduledTime : null,
        items: cart.map((item) => ({
          product_id: item._originalProductId || item.id, // Usar el ID original del producto
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })),
        total: calculateTotal(),
        status: "pending_payment",
        created_at: response.data.created_at,
      };

      localStorage.setItem("lastOrder", JSON.stringify(orderData));

      toast({
        title: "¡Pedido creado exitosamente!",
        description: `Número de pedido: ${response.data.sale_number}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      // Limpiar carrito
      localStorage.removeItem("customerCart");
      window.dispatchEvent(new Event("cartUpdated"));

      // Redirigir a página de confirmación
      history.push("/customer/order-success");

    } catch (error) {
      console.error('❌ Error al crear el pedido:', error);

      let errorMessage = "No se pudo procesar el pedido. Por favor intenta nuevamente.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error al procesar el pedido",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pt={{ base: "80px", md: "100px" }} px={{ base: "15px", md: "30px" }} pb="30px">
      <Box mb={8}>
        <Text fontSize="3xl" fontWeight="bold" color={textColor} mb={2}>
          Finalizar Compra
        </Text>
        <Text color="gray.500">Completa tus datos para recibir tu pedido</Text>
      </Box>

      <Flex direction={{ base: "column", lg: "row" }} gap={6}>
        {/* Checkout Form */}
        <Box flex={1}>
          <Card>
            <CardHeader p="12px 5px" mb="12px">
              <Text fontSize="lg" color={textColor} fontWeight="bold">
                Información de Entrega
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Nombre Completo</FormLabel>
                  <Input
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Correo Electrónico</FormLabel>
                  <Input
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    size="lg"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Teléfono</FormLabel>
                  <Input
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    placeholder="Ej: 71234567"
                    size="lg"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Tipo de Pedido</FormLabel>
                  <Select
                    name="order_type"
                    value={formData.order_type}
                    onChange={handleChange}
                    size="lg"
                    bg={selectBg}
                    color={selectColor}
                    borderColor={selectBorderColor}
                    _hover={{
                      borderColor: selectHoverBorderColor,
                    }}
                    sx={{
                      option: {
                        bg: selectBg,
                        color: selectColor,
                      }
                    }}
                  >
                    <option value="para_llevar">Para llevar (Recoger en el establecimiento)</option>
                    <option value="en_el_local">En el Establecimiento (Consumir en el Establecimiento)</option>
                  </Select>
                </FormControl>

                <Box>
                  <Checkbox
                    isChecked={scheduleDelivery}
                    onChange={(e) => {
                      setScheduleDelivery(e.target.checked);
                      if (!e.target.checked) {
                        setScheduledTime("");
                      }
                    }}
                    colorScheme="blue"
                    size="lg"
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      Programar entrega para más tarde
                    </Text>
                  </Checkbox>
                </Box>

                {scheduleDelivery && (
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Hora de entrega</FormLabel>
                    <Box
                      p={4}
                      borderWidth="2px"
                      borderRadius="lg"
                      borderColor={timePickerBorderColor}
                      bg={timePickerBg}
                    >
                      {/* Display de hora seleccionada */}
                      <Flex justify="center" mb={4}>
                        <Box
                          px={6}
                          py={3}
                          bg={timePickerDisplayBg}
                          borderRadius="lg"
                          borderWidth="2px"
                          borderColor="blue.500"
                        >
                          <Text fontSize="3xl" fontWeight="bold" color="blue.500" textAlign="center">
                            {scheduledTime || '--:--'}
                          </Text>
                        </Box>
                      </Flex>

                      {/* Selector de Horas */}
                      <VStack spacing={3} align="stretch">
                        <Box>
                          <Text fontSize="xs" fontWeight="semibold" mb={2} color={timePickerTextColor}>
                            Selecciona la hora:
                          </Text>
                          <Flex wrap="wrap" gap={2}>
                            {Array.from({ length: 15 }, (_, i) => i + 8).map(hour => {
                              const hourStr = hour.toString().padStart(2, '0');
                              const isSelected = scheduledTime.split(':')[0] === hourStr;
                              return (
                                <Button
                                  key={hour}
                                  size="sm"
                                  colorScheme={isSelected ? "blue" : "gray"}
                                  variant={isSelected ? "solid" : "outline"}
                                  onClick={() => {
                                    const minute = scheduledTime.split(':')[1] || '00';
                                    setScheduledTime(`${hourStr}:${minute}`);
                                  }}
                                  minW="45px"
                                  fontWeight={isSelected ? "bold" : "normal"}
                                >
                                  {hourStr}
                                </Button>
                              );
                            })}
                          </Flex>
                        </Box>

                        <Divider />

                        {/* Selector de Minutos */}
                        <Box>
                          <Text fontSize="xs" fontWeight="semibold" mb={2} color={timePickerTextColor}>
                            Selecciona los minutos:
                          </Text>
                          <Flex gap={2}>
                            {['00', '15', '30', '45'].map(minute => {
                              const isSelected = scheduledTime.split(':')[1] === minute;
                              return (
                                <Button
                                  key={minute}
                                  flex={1}
                                  size="md"
                                  colorScheme={isSelected ? "blue" : "gray"}
                                  variant={isSelected ? "solid" : "outline"}
                                  onClick={() => {
                                    const hour = scheduledTime.split(':')[0] || '08';
                                    setScheduledTime(`${hour}:${minute}`);
                                  }}
                                  fontWeight={isSelected ? "bold" : "normal"}
                                >
                                  :{minute}
                                </Button>
                              );
                            })}
                          </Flex>
                        </Box>
                      </VStack>
                    </Box>
                    <Text fontSize="xs" color={timePickerInfoColor} mt={2}>
                      🕐 Horario de atención: 8:00 AM - 10:00 PM
                    </Text>
                  </FormControl>
                )}

                <Divider />

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold">
                    Método de Pago
                  </FormLabel>
                  <RadioGroup
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, payment_method: value }))
                    }
                  >
                    <Stack spacing={3}>
                      <Radio value="qr" colorScheme="blue">
                        <Box>
                          <Text fontWeight="bold">QR</Text>
                          <Text fontSize="sm" color="gray.500">
                            Código QR para pago digital
                          </Text>
                        </Box>
                      </Radio>
                      <Radio value="paypal" colorScheme="blue">
                        <Box>
                          <Text fontWeight="bold">PayPal</Text>
                          <Text fontSize="sm" color="gray.500">
                            Pago digital con PayPal
                          </Text>
                        </Box>
                      </Radio>
                      <Radio value="stripe" colorScheme="blue">
                        <Box>
                          <Text fontWeight="bold">Stripe</Text>
                          <Text fontSize="sm" color="gray.500">
                            Pago con tarjeta vía Stripe
                          </Text>
                        </Box>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </Box>

        {/* Order Summary */}
        <Box w={{ base: "100%", lg: "400px" }}>
          <Card position="sticky" top="100px">
            <CardHeader p="12px 5px" mb="12px">
              <Text fontSize="lg" color={textColor} fontWeight="bold">
                Resumen del Pedido
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Items */}
                <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                  {cart.map((item) => (
                    <HStack key={item.id} justify="space-between">
                      <Text fontSize="sm">
                        {item.name} x {item.quantity}
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        Bs. {(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

                <Divider />

                <HStack justify="space-between">
                  <Text color="gray.600">Subtotal</Text>
                  <Text fontWeight="bold">Bs. {calculateTotal().toFixed(2)}</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="gray.600">Envío</Text>
                  <Text fontWeight="bold" color="green.500">
                    Gratis
                  </Text>
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <Text fontSize="xl" fontWeight="bold">
                    Total
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    Bs. {calculateTotal().toFixed(2)}
                  </Text>
                </HStack>

                <Button
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  onClick={handleSubmitOrder}
                  isLoading={loading}
                  loadingText="Procesando..."
                  mt={4}
                >
                  Confirmar Pedido
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  w="100%"
                  onClick={() => history.push("/customer/cart")}
                  isDisabled={loading}
                >
                  Volver al carrito
                </Button>

                <Box
                  p={3}
                  bg="blue.50"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="blue.200"
                >
                  <Text fontSize="xs" color="blue.700" textAlign="center">
                    🔒 Tu información está segura y protegida
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
}

export default Checkout;
