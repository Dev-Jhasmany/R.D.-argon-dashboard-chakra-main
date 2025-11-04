import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  Select,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
} from "@chakra-ui/react";
import { CheckCircleIcon, DownloadIcon } from "@chakra-ui/icons";
import { useHistory, useLocation } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import TicketReceipt from "components/TicketReceipt/TicketReceipt";

function OrderSuccess() {
  const textColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'white');
  const history = useHistory();
  const location = useLocation();
  const toast = useToast();

  // Estados para el pedido
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Estados para modales de pago
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  // Estados para PayPal
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalStatus, setPaypalStatus] = useState('input');

  // Estados para Stripe
  const [stripePhone, setStripePhone] = useState('');
  const [stripeMethod, setStripeMethod] = useState('whatsapp');
  const [stripeStatus, setStripeStatus] = useState('input');

  // Estados para comprobante de pago (QR)
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);

  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [waitingForValidation, setWaitingForValidation] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // 'confirmed', 'rejected', null

  // Estados para el ticket
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [businessInfo, setBusinessInfo] = useState({
    name: 'TIENDA ONLINE',
    branch: 'Pedidos en Línea',
    address: 'Santa Cruz, Bolivia',
    phone: '755-60-845',
    website: 'www.tiendaonline.com',
  });

  // Ref para el QR
  const qrRef = useRef();

  useEffect(() => {
    // Obtener datos del pedido desde localStorage o location state
    const savedOrderData = localStorage.getItem('lastOrder');
    if (savedOrderData) {
      const order = JSON.parse(savedOrderData);
      setOrderData(order);
      setPaymentMethod(order.payment_method);

      // Abrir modal según método de pago
      if (order.payment_method === 'qr') {
        setIsQRModalOpen(true);
      } else if (order.payment_method === 'paypal') {
        setIsPayPalModalOpen(true);
      } else if (order.payment_method === 'stripe') {
        setIsStripeModalOpen(true);
      }
    }
  }, []);

  // Polling para verificar si el cajero validó el pago
  useEffect(() => {
    if (!waitingForValidation || !orderData) return;

    const checkValidationStatus = async () => {
      try {
        // Primero verificar en localStorage (para sincronización local)
        const pendingOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
        const currentOrder = pendingOrders.find(o => o.order_number === orderData.order_number);

        // Si fue confirmado localmente, actualizar estado
        if (currentOrder?.status === 'confirmed') {
          setValidationStatus('confirmed');
          setWaitingForValidation(false);

          toast({
            title: '¡Pago Confirmado! ✅',
            description: 'El cajero ha validado tu pago exitosamente',
            status: 'success',
            duration: 8000,
            isClosable: true,
            position: 'top',
          });

          // Generar ticket automáticamente
          setTimeout(() => {
            generateTicket();
          }, 1000);
          return;
        }

        // Si no está confirmado localmente, verificar en el backend
        // Buscar si existe un pedido para esta venta en el backend
        const publicApi = (await import('services/publicApi')).default;

        try {
          const salesResponse = await publicApi.get('/public/sales');
          const sale = salesResponse.data.find(s => s.sale_number === orderData.order_number);

          if (sale) {
            // Ahora verificar si existe un pedido para esta venta
            const ordersResponse = await publicApi.get('/public/orders');
            const order = ordersResponse.data.find(o => o.saleId === sale.id);

            if (order) {
              // El pedido existe, el pago fue confirmado
              setValidationStatus('confirmed');
              setWaitingForValidation(false);

              // Actualizar localStorage también
              const updatedOrders = pendingOrders.map(o => {
                if (o.order_number === orderData.order_number) {
                  return { ...o, status: 'confirmed', confirmed_at: new Date().toISOString() };
                }
                return o;
              });
              localStorage.setItem('pendingPaymentOrders', JSON.stringify(updatedOrders));

              toast({
                title: '¡Pago Confirmado! ✅',
                description: 'El cajero ha validado tu pago exitosamente',
                status: 'success',
                duration: 8000,
                isClosable: true,
                position: 'top',
              });

              // Generar ticket automáticamente
              setTimeout(() => {
                generateTicket();
              }, 1000);
            }
          }
        } catch (error) {
          console.error('Error al verificar estado del pedido:', error);
          // No hacer nada, seguir esperando
        }
      } catch (error) {
        console.error('Error en checkValidationStatus:', error);
      }
    };

    // Verificar cada 3 segundos
    const intervalId = setInterval(checkValidationStatus, 3000);

    // Ejecutar inmediatamente también
    checkValidationStatus();

    return () => clearInterval(intervalId);
  }, [waitingForValidation, orderData]);

  const saveOrderToPendingPayments = (status = 'pending_payment') => {
    if (!orderData) return;

    const pendingOrder = {
      ...orderData,
      status: status,
      paymentDetails: {
        method: paymentMethod,
        paypalEmail: paypalEmail || null,
        stripePhone: stripePhone || null,
        stripeMethod: stripeMethod || null,
        paymentProof: paymentProofPreview || null, // Guardar comprobante de pago
      },
      timestamp: new Date().toISOString(),
    };

    // Guardar en localStorage para que ConfirmPayment lo vea
    const existingOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
    existingOrders.push(pendingOrder);
    localStorage.setItem('pendingPaymentOrders', JSON.stringify(existingOrders));
  };

  // Función para manejar la subida del comprobante
  const handleProofUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo inválido',
        description: 'Por favor sube una imagen (JPG, PNG, etc.)',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El tamaño máximo permitido es 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setPaymentProof(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofPreview(reader.result);
    };
    reader.readAsDataURL(file);

    toast({
      title: 'Comprobante cargado',
      description: 'Imagen cargada exitosamente',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });
  };

  // Función para remover el comprobante
  const removeProof = () => {
    setPaymentProof(null);
    setPaymentProofPreview(null);
  };

  // Función para generar y mostrar el ticket
  const generateTicket = () => {
    if (!orderData) return;

    const orderTypeLabel = orderData.order_type === 'en_el_local' ? 'En el local' : 'Para llevar';
    const scheduledInfo = orderData.scheduled_delivery && orderData.scheduled_time
      ? ` - Entrega programada: ${orderData.scheduled_time}`
      : '';
    const ticketSaleData = {
      sale_number: orderData.order_number,
      created_at: orderData.created_at,
      customer_name: orderData.customer_name,
      total: orderData.total,
      discount: 0,
      payment_method: orderData.payment_method,
      notes: `Tipo de pedido: ${orderTypeLabel}${scheduledInfo}`,
      details: orderData.items.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      }))
    };

    setTicketData(ticketSaleData);
    setIsTicketModalOpen(true);
  };

  // Función para descargar el QR como imagen
  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Crear un canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Descargar como PNG
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `QR-Pedido-${orderData?.order_number}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Funciones para QR
  const closeQRModal = async () => {
    // Validar que se haya subido el comprobante
    if (!paymentProof || !paymentProofPreview) {
      toast({
        title: 'Comprobante requerido',
        description: 'Por favor sube una captura del comprobante de pago',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setIsQRModalOpen(false);
    setPaymentCompleted(true);
    setWaitingForValidation(true); // Activar modo de espera
    saveOrderToPendingPayments('pending_confirmation');

    // Enviar comprobante al backend
    try {
      const publicApi = (await import('services/publicApi')).default;

      if (orderData.sale_id) {
        // Usar el ID de la venta guardado en orderData
        await publicApi.patch(`/public/sales/${orderData.sale_id}/payment-proof`, {
          payment_proof: paymentProofPreview
        });
        console.log('✅ Comprobante enviado al backend exitosamente');
        console.log('   Sale ID:', orderData.sale_id);
        console.log('   Order Number:', orderData.order_number);
      } else {
        console.error('❌ No se encontró sale_id en orderData');
        console.log('OrderData:', orderData);
      }
    } catch (error) {
      console.error('❌ Error al enviar comprobante al backend:', error);
      console.error('Error details:', error.response?.data);
      // No mostrar error al usuario, ya que se guardó en localStorage como fallback
    }

    toast({
      title: 'Comprobante Enviado ✓',
      description: 'Esperando validación del cajero...',
      status: 'info',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
  };

  // Funciones para PayPal
  const handleSendPayPalEmail = () => {
    if (!paypalEmail || !paypalEmail.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor ingrese un correo electrónico válido',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setPaypalStatus('sending');

    toast({
      title: 'Enviando solicitud',
      description: `Enviando solicitud de pago a ${paypalEmail}...`,
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });

    setTimeout(() => {
      setPaypalStatus('waiting');
      toast({
        title: 'Solicitud enviada',
        description: 'Esperando confirmación del pago en PayPal',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      setTimeout(() => {
        setPaypalStatus('confirmed');
        toast({
          title: 'Pago simulado',
          description: 'Simulación de pago confirmado',
          status: 'success',
          duration: 4000,
          isClosable: true,
          position: 'top-right',
        });
      }, 4000);
    }, 2000);
  };

  const closePayPalModal = () => {
    if (paypalStatus !== 'confirmed') {
      toast({
        title: 'Pago no completado',
        description: 'Debe completar el proceso de pago',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setIsPayPalModalOpen(false);
    setPaymentCompleted(true);
    saveOrderToPendingPayments('pending_confirmation');

    toast({
      title: 'Pago enviado',
      description: 'Tu pago está siendo procesado. El cajero lo validará pronto.',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    // Generar ticket automáticamente
    setTimeout(() => {
      generateTicket();
    }, 500);
  };

  // Funciones para Stripe
  const handleSendStripeLink = () => {
    if (!stripePhone || stripePhone.length < 8) {
      toast({
        title: 'Número inválido',
        description: 'Por favor ingrese un número de teléfono válido',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setStripeStatus('sending');

    const methodName = stripeMethod === 'whatsapp' ? 'WhatsApp' : 'SMS';
    toast({
      title: 'Enviando vínculo',
      description: `Enviando vínculo de pago por ${methodName} a +${stripePhone}...`,
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });

    setTimeout(() => {
      setStripeStatus('waiting');
      toast({
        title: 'Vínculo enviado',
        description: `El vínculo ha sido enviado por ${methodName}`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      setTimeout(() => {
        setStripeStatus('confirmed');
        toast({
          title: 'Pago simulado',
          description: 'Simulación de pago completado con Stripe',
          status: 'success',
          duration: 4000,
          isClosable: true,
          position: 'top-right',
        });
      }, 5000);
    }, 2000);
  };

  const closeStripeModal = () => {
    if (stripeStatus !== 'confirmed') {
      toast({
        title: 'Pago no completado',
        description: 'Debe completar el proceso de pago',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setIsStripeModalOpen(false);
    setPaymentCompleted(true);
    saveOrderToPendingPayments('pending_confirmation');

    toast({
      title: 'Pago enviado',
      description: 'Tu pago está siendo procesado. El cajero lo validará pronto.',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    // Generar ticket automáticamente
    setTimeout(() => {
      generateTicket();
    }, 500);
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

  return (
    <Box pt={{ base: "80px", md: "100px" }} px={{ base: "15px", md: "30px" }} pb="30px" bg="transparent">
      <Flex justify="center" align="center" minH="60vh">
        <Card maxW="600px" w="100%">
          <CardBody>
            <VStack spacing={6} py={8} px={4}>
              {/* Icono dinámico según estado */}
              {validationStatus === 'confirmed' ? (
                <Icon as={CheckCircleIcon} w={20} h={20} color="green.500" />
              ) : validationStatus === 'rejected' ? (
                <Box fontSize="6xl">❌</Box>
              ) : waitingForValidation ? (
                <Box fontSize="6xl" animation="pulse 2s infinite">⏳</Box>
              ) : (
                <Icon as={CheckCircleIcon} w={20} h={20} color="green.500" />
              )}

              {/* Título dinámico */}
              <Text fontSize="3xl" fontWeight="bold" color={textColor} textAlign="center">
                {validationStatus === 'confirmed'
                  ? '¡Pago Confirmado! ✅'
                  : validationStatus === 'rejected'
                  ? 'Pago Rechazado ❌'
                  : waitingForValidation
                  ? 'Esperando Validación...'
                  : paymentCompleted
                  ? '¡Pedido Realizado con Éxito!'
                  : '¡Pedido Creado!'}
              </Text>

              {/* Descripción dinámica */}
              <Text fontSize="lg" color="gray.600" textAlign="center">
                {validationStatus === 'confirmed'
                  ? '¡Excelente! El cajero ha validado tu pago correctamente. Tu pedido está siendo preparado.'
                  : validationStatus === 'rejected'
                  ? 'Lo sentimos, no pudimos validar tu pago. Por favor contacta con soporte o intenta nuevamente.'
                  : waitingForValidation
                  ? 'Tu comprobante ha sido enviado. Un cajero lo está revisando en este momento.'
                  : paymentCompleted
                  ? 'Gracias por tu compra. Tu pago está siendo validado por nuestro cajero.'
                  : 'Por favor completa el proceso de pago para confirmar tu pedido.'}
              </Text>

              {orderData && (
                <Box w="100%" p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                  <VStack spacing={2} align="start">
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm" fontWeight="bold" color="blue.700">
                        Número de Pedido:
                      </Text>
                      <Text fontSize="sm" color="blue.600">
                        {orderData.order_number || 'ORD-' + Date.now()}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm" fontWeight="bold" color="blue.700">
                        Método de Pago:
                      </Text>
                      {getPaymentMethodBadge(paymentMethod)}
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm" fontWeight="bold" color="blue.700">
                        Total:
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">
                        Bs. {orderData.total?.toFixed(2) || '0.00'}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Alerta de espera de validación */}
              {waitingForValidation && (
                <Box
                  w="100%"
                  p={6}
                  bg="orange.50"
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor="orange.300"
                >
                  <VStack spacing={3} align="center">
                    <Box fontSize="5xl" animation="pulse 2s infinite">
                      👀
                    </Box>
                    <Text fontSize="lg" fontWeight="bold" color="orange.700">
                      Validando comprobante...
                    </Text>
                    <Text fontSize="sm" color="orange.600" textAlign="center">
                      Un cajero está revisando tu comprobante de pago.
                      Esta página se actualizará automáticamente cuando se valide.
                    </Text>
                    <HStack spacing={2} mt={2}>
                      <Box w={2} h={2} bg="orange.500" borderRadius="full" animation="bounce 1s infinite" />
                      <Box w={2} h={2} bg="orange.500" borderRadius="full" animation="bounce 1s infinite 0.2s" />
                      <Box w={2} h={2} bg="orange.500" borderRadius="full" animation="bounce 1s infinite 0.4s" />
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Mensaje de confirmación */}
              {validationStatus === 'confirmed' && (
                <Box
                  w="100%"
                  p={6}
                  bg="green.50"
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor="green.300"
                >
                  <VStack spacing={3} align="start">
                    <Text fontSize="lg" fontWeight="bold" color="green.700">
                      ✅ ¡Pago Validado!
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      📦 Estamos preparando tu pedido
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      🚚 Te contactaremos para coordinar la entrega
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      📧 Recibirás un correo de confirmación
                    </Text>
                  </VStack>
                </Box>
              )}

              {/* Mensaje de rechazo */}
              {validationStatus === 'rejected' && (
                <Box
                  w="100%"
                  p={6}
                  bg="red.50"
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor="red.300"
                >
                  <VStack spacing={3} align="start">
                    <Text fontSize="lg" fontWeight="bold" color="red.700">
                      ❌ Pago No Validado
                    </Text>
                    <Text fontSize="sm" color="red.600">
                      El cajero no pudo validar tu comprobante de pago.
                    </Text>
                    <Text fontSize="sm" color="red.600">
                      Por favor contacta con soporte o intenta realizar el pedido nuevamente.
                    </Text>
                  </VStack>
                </Box>
              )}

              {/* Info general cuando está completo pero sin validar aún */}
              {paymentCompleted && !waitingForValidation && !validationStatus && (
                <Box
                  w="100%"
                  p={6}
                  bg="green.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="green.200"
                >
                  <VStack spacing={3} align="start">
                    <Text fontSize="sm" fontWeight="bold" color="green.700">
                      ¿Qué sigue?
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      ✅ El cajero validará tu pago en breve
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      📦 Prepararemos tu pedido con cuidado
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      🚚 Te contactaremos para coordinar la entrega
                    </Text>
                  </VStack>
                </Box>
              )}

              <VStack spacing={3} w="100%">
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  onClick={() => history.push("/customer/shop")}
                >
                  Seguir Comprando
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  w="100%"
                  onClick={() => history.push("/customer/orders")}
                >
                  Ver Mis Pedidos
                </Button>
              </VStack>

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Si tienes alguna pregunta, no dudes en contactarnos
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Flex>

      {/* Modal de QR para pago */}
      <Modal isOpen={isQRModalOpen} onClose={() => {}} size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>Pago con QR - Pedido {orderData?.order_number}</ModalHeader>
          <ModalBody>
            {orderData && (
              <Flex direction="column" align="center" gap="20px" py={4}>
                <Box p={4} bg="blue.50" borderRadius="md" width="full">
                  <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2}>
                    Monto a Pagar
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.500" textAlign="center">
                    Bs. {orderData.total?.toFixed(2)}
                  </Text>
                </Box>

                <Box ref={qrRef} p={6} bg="white" borderRadius="md" boxShadow="lg" border="2px solid" borderColor="gray.200">
                  <QRCodeSVG
                    value={JSON.stringify({
                      order_number: orderData.order_number || 'ORD-' + Date.now(),
                      total: orderData.total?.toFixed(2),
                      currency: 'BOB',
                      customer: orderData.customer_name,
                      timestamp: new Date().toISOString(),
                    })}
                    size={250}
                    level="H"
                    includeMargin={true}
                  />
                </Box>

                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={downloadQR}
                  width="full"
                >
                  Descargar QR
                </Button>

                <Box p={4} bg="gray.50" borderRadius="md" width="full">
                  <Text fontSize="sm" textAlign="center" color="gray.600" mb={2}>
                    1. Escanee el código QR con su aplicación de pago
                  </Text>
                  <Text fontSize="sm" textAlign="center" color="gray.600">
                    2. Complete el pago en su aplicación
                  </Text>
                  <Text fontSize="sm" textAlign="center" color="gray.600" fontWeight="bold" mt={2}>
                    3. Suba una captura del comprobante
                  </Text>
                </Box>

                <Divider />

                {/* Sección de subida de comprobante */}
                <Box p={4} bg="orange.50" borderRadius="md" width="full" borderWidth="2px" borderColor="orange.200">
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="md" fontWeight="bold" color="orange.700">
                        📸 Comprobante de Pago
                      </Text>
                      {paymentProofPreview && (
                        <Badge colorScheme="green" fontSize="sm">
                          ✓ Cargado
                        </Badge>
                      )}
                    </HStack>

                    {!paymentProofPreview ? (
                      <>
                        <Text fontSize="sm" color="gray.600">
                          Sube una captura de pantalla o foto del comprobante de pago
                        </Text>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleProofUpload}
                          display="none"
                          id="proof-upload"
                        />
                        <Button
                          as="label"
                          htmlFor="proof-upload"
                          colorScheme="orange"
                          cursor="pointer"
                          leftIcon={<DownloadIcon />}
                        >
                          Seleccionar Imagen
                        </Button>
                      </>
                    ) : (
                      <VStack spacing={3}>
                        <Box
                          width="full"
                          borderRadius="md"
                          overflow="hidden"
                          border="2px solid"
                          borderColor="green.300"
                        >
                          <img
                            src={paymentProofPreview}
                            alt="Comprobante de pago"
                            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                          />
                        </Box>
                        <HStack width="full" spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            onClick={removeProof}
                            flex={1}
                          >
                            Cambiar imagen
                          </Button>
                          <Badge colorScheme="green" p={2} fontSize="sm" flex={1} textAlign="center">
                            ✓ Listo para enviar
                          </Badge>
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                </Box>

                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="xs">
                    El comprobante será revisado por nuestro cajero para validar tu pago
                  </AlertDescription>
                </Alert>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="green"
              onClick={closeQRModal}
              width="full"
              size="lg"
              isDisabled={!paymentProofPreview}
            >
              {paymentProofPreview ? '✓ Enviar Comprobante' : '📸 Sube el comprobante primero'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de PayPal para pago */}
      <Modal isOpen={isPayPalModalOpen} onClose={() => {}} size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pago con PayPal - Pedido {orderData?.order_number}</ModalHeader>
          <ModalBody>
            {orderData && (
              <Flex direction="column" align="center" gap="20px" py={4}>
                <Box p={4} bg="blue.50" borderRadius="md" width="full">
                  <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2}>
                    Monto a Pagar
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600" textAlign="center">
                    Bs. {orderData.total?.toFixed(2)}
                  </Text>
                </Box>

                <Box p={8} bg="white" borderRadius="md" boxShadow="xl" border="2px solid" borderColor="blue.200" width="full">
                  <Flex direction="column" align="center" gap="20px">
                    <Box fontSize="6xl" color="blue.600" textAlign="center">
                      💳
                    </Box>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600" textAlign="center">
                      PayPal
                    </Text>

                    {paypalStatus === 'input' && (
                      <>
                        <Text fontSize="md" textAlign="center" color="gray.600">
                          Ingrese su correo electrónico de PayPal
                        </Text>

                        <FormControl isRequired width="full">
                          <FormLabel fontSize="sm">Correo electrónico de PayPal</FormLabel>
                          <Input
                            type="email"
                            placeholder="tu-email@ejemplo.com"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            size="lg"
                            bg={inputBg}
                            color={inputTextColor}
                          />
                        </FormControl>

                        <Button colorScheme="blue" size="lg" width="full" onClick={handleSendPayPalEmail} isDisabled={!paypalEmail}>
                          Simular Pago con PayPal
                        </Button>
                      </>
                    )}

                    {paypalStatus === 'sending' && (
                      <Box textAlign="center">
                        <Text fontSize="lg" fontWeight="bold" color="blue.600" mb={3}>
                          Enviando solicitud...
                        </Text>
                        <Box fontSize="4xl" mb={3}>📧</Box>
                        <Text fontSize="sm" color="gray.600">
                          Procesando pago a: {paypalEmail}
                        </Text>
                      </Box>
                    )}

                    {paypalStatus === 'waiting' && (
                      <Box textAlign="center">
                        <Text fontSize="lg" fontWeight="bold" color="orange.600" mb={3}>
                          Procesando pago...
                        </Text>
                        <Box fontSize="5xl" mb={3}>📱</Box>
                        <Text fontSize="sm" color="gray.600">
                          Simulando confirmación de pago
                        </Text>
                      </Box>
                    )}

                    {paypalStatus === 'confirmed' && (
                      <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="green.600" mb={3}>
                          ¡Pago Simulado!
                        </Text>
                        <Box fontSize="6xl" mb={3}>✅</Box>
                        <Alert status="success" borderRadius="md">
                          <AlertIcon />
                          <AlertDescription fontSize="sm">
                            El pago ha sido simulado. El cajero validará tu pedido.
                          </AlertDescription>
                        </Alert>
                      </Box>
                    )}
                  </Flex>
                </Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            {paypalStatus === 'confirmed' ? (
              <Button colorScheme="green" onClick={closePayPalModal} width="full" size="lg">
                Finalizar
              </Button>
            ) : (
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Esperando confirmación de pago...
              </Text>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Stripe para pago */}
      <Modal isOpen={isStripeModalOpen} onClose={() => {}} size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pago con Stripe - Pedido {orderData?.order_number}</ModalHeader>
          <ModalBody>
            {orderData && (
              <Flex direction="column" align="center" gap="20px" py={4}>
                <Box p={4} bg="purple.50" borderRadius="md" width="full">
                  <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2}>
                    Monto a Pagar
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="purple.600" textAlign="center">
                    Bs. {orderData.total?.toFixed(2)}
                  </Text>
                </Box>

                <Box p={8} bg="white" borderRadius="md" boxShadow="xl" border="2px solid" borderColor="purple.200" width="full">
                  <Flex direction="column" align="center" gap="20px">
                    <Box fontSize="6xl" color="purple.600" textAlign="center">
                      💳
                    </Box>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.600" textAlign="center">
                      Stripe
                    </Text>

                    {stripeStatus === 'input' && (
                      <>
                        <Text fontSize="md" textAlign="center" color="gray.600">
                          Ingrese su número de teléfono
                        </Text>

                        <FormControl isRequired width="full">
                          <FormLabel fontSize="sm">Método de envío</FormLabel>
                          <Select value={stripeMethod} onChange={(e) => setStripeMethod(e.target.value)} size="lg" bg={inputBg} color={inputTextColor}>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="sms">SMS</option>
                          </Select>
                        </FormControl>

                        <FormControl isRequired width="full">
                          <FormLabel fontSize="sm">Número de teléfono</FormLabel>
                          <Input
                            type="tel"
                            placeholder="591 XXXXXXXX"
                            value={stripePhone}
                            onChange={(e) => setStripePhone(e.target.value.replace(/\D/g, ''))}
                            size="lg"
                            bg={inputBg}
                            color={inputTextColor}
                          />
                        </FormControl>

                        <Button colorScheme="purple" size="lg" width="full" onClick={handleSendStripeLink} isDisabled={!stripePhone || stripePhone.length < 8}>
                          Simular Pago con Stripe
                        </Button>
                      </>
                    )}

                    {stripeStatus === 'sending' && (
                      <Box textAlign="center">
                        <Text fontSize="lg" fontWeight="bold" color="purple.600" mb={3}>
                          Enviando vínculo...
                        </Text>
                        <Box fontSize="4xl" mb={3}>
                          {stripeMethod === 'whatsapp' ? '📱' : '💬'}
                        </Box>
                        <Text fontSize="sm" color="gray.600">
                          Enviando a: +{stripePhone}
                        </Text>
                      </Box>
                    )}

                    {stripeStatus === 'waiting' && (
                      <Box textAlign="center">
                        <Text fontSize="lg" fontWeight="bold" color="orange.600" mb={3}>
                          Procesando pago...
                        </Text>
                        <Box fontSize="5xl" mb={3}>
                          {stripeMethod === 'whatsapp' ? '💬' : '📱'}
                        </Box>
                        <Text fontSize="sm" color="gray.600">
                          Simulando confirmación de pago
                        </Text>
                      </Box>
                    )}

                    {stripeStatus === 'confirmed' && (
                      <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="green.600" mb={3}>
                          ¡Pago Simulado!
                        </Text>
                        <Box fontSize="6xl" mb={3}>✅</Box>
                        <Alert status="success" borderRadius="md">
                          <AlertIcon />
                          <AlertDescription fontSize="sm">
                            El pago ha sido simulado. El cajero validará tu pedido.
                          </AlertDescription>
                        </Alert>
                      </Box>
                    )}
                  </Flex>
                </Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            {stripeStatus === 'confirmed' ? (
              <Button colorScheme="green" onClick={closeStripeModal} width="full" size="lg">
                Finalizar
              </Button>
            ) : (
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Esperando confirmación de pago...
              </Text>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal del Ticket - Se abre automáticamente después del pago */}
      {ticketData && (
        <TicketReceipt
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          saleData={ticketData}
          businessInfo={businessInfo}
        />
      )}
    </Box>
  );
}

export default OrderSuccess;
