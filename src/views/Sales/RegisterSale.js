/**
 * COMPONENTE: RegisterSale (Registro de Ventas)
 *
 * Este componente maneja el proceso completo de registro de ventas con soporte
 * para múltiples métodos de pago y gestión de carrito de compras.
 *
 * FLUJO DE SECUENCIA:
 * 1. Usuario agrega productos al carrito
 * 2. Sistema calcula subtotales y total
 * 3. Usuario selecciona método de pago
 * 4. Si es método digital (QR, PayPal, Stripe): abre modal específico
 * 5. Usuario confirma venta
 * 6. salesService.createSale() → POST /sales
 * 7. Backend crea venta, actualiza stock, registra movimientos
 * 8. Frontend muestra recibo y limpia formulario
 *
 * MÉTODOS DE PAGO SOPORTADOS:
 * - efectivo: Pago en efectivo (default)
 * - tarjeta: Pago con tarjeta (POS)
 * - transferencia: Transferencia bancaria
 * - qr: Código QR con QRCodeSVG (modal)
 * - paypal: Pago digital con email (modal con estados)
 * - stripe: Pago digital con WhatsApp/SMS (modal con estados)
 *
 * ESTADO GESTIONADO:
 * - cart: Array de productos en el carrito
 * - formData: Datos del cliente y venta
 * - isQRModalOpen, isPayPalModalOpen, isStripeModalOpen: Control de modales
 * - paypalEmail, paypalStatus: Estado de pago PayPal
 * - stripePhone, stripeMethod, stripeStatus: Estado de pago Stripe
 * - products, promotions: Datos desde backend
 * - salesHistory: Últimas 10 ventas
 * - allProducts: Inventario completo
 *
 * FUNCIONALIDADES:
 * - Carrito dinámico con agregar/eliminar productos
 * - Cálculo automático de subtotales y totales
 * - Aplicación de descuentos y promociones
 * - Generación de código QR
 * - Gestión de estados de pago digital
 * - Historial de ventas recientes
 * - Alertas de stock bajo
 * - Validación de stock antes de vender
 *
 * DEPENDENCIAS:
 * - salesService: Crear ventas
 * - productService: Obtener productos y stock
 * - promotionService: Obtener promociones activas
 * - qrcode.react: Generación de códigos QR
 * - Chakra UI: Componentes de UI
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { QRCodeSVG } from 'qrcode.react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import salesService from 'services/salesService';
import productService from 'services/productService';
import promotionService from 'services/promotionService';
import orderService from 'services/orderService';
import settingsService from 'services/settingsService';
import cashRegisterService from 'services/cashRegisterService';
import { useAuth } from 'contexts/AuthContext';
import TicketReceipt from 'components/TicketReceipt/TicketReceipt';

function RegisterSale() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'white');
  const toast = useToast();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [saleInfo, setSaleInfo] = useState(null);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalStatus, setPaypalStatus] = useState('input'); // 'input', 'sending', 'waiting', 'confirmed'
  const [stripePhone, setStripePhone] = useState('');
  const [stripeMethod, setStripeMethod] = useState('whatsapp'); // 'whatsapp' o 'sms'
  const [stripeStatus, setStripeStatus] = useState('input'); // 'input', 'sending', 'waiting', 'confirmed'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [cart, setCart] = useState([]);
  const [hasProducts, setHasProducts] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [openCashRegisters, setOpenCashRegisters] = useState([]);
  const [selectedCashRegister, setSelectedCashRegister] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_nit: '',
    discount: 0,
    payment_method: 'efectivo',
    notes: '',
  });

  useEffect(() => {
    loadProducts();
    loadPromotions();
    loadSalesHistory();
    loadInventory();
    loadBusinessSettings();
    loadOpenCashRegisters();
  }, []);

  const loadProducts = async () => {
    const result = await productService.getAllProducts();
    if (result.success) {
      const activeProducts = result.data.filter((p) => p.is_active && parseFloat(p.stock) > 0);
      setProducts(activeProducts);
      // Verificar si hay al menos un producto ACTIVO con stock
      setHasProducts(activeProducts.length > 0);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const loadPromotions = async () => {
    const result = await promotionService.getAllPromotions();
    if (result.success) {
      // Mostrar todas las promociones registradas (sin filtrar por fechas)
      setPromotions(result.data);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const loadSalesHistory = async () => {
    setLoadingHistory(true);
    const result = await salesService.getAllSales();
    if (result.success) {
      // Ordenar por fecha más reciente primero y limitar a las últimas 10 ventas
      const sortedSales = result.data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      setSalesHistory(sortedSales);
    } else {
      toast({
        title: 'Error al cargar historial',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
    setLoadingHistory(false);
  };

  const loadInventory = async () => {
    setLoadingInventory(true);
    const result = await productService.getAllProducts();
    if (result.success) {
      // Ordenar por stock ascendente (productos con menos stock primero)
      const sortedProducts = result.data
        .filter((p) => p.is_active) // Solo productos activos
        .sort((a, b) => parseFloat(a.stock) - parseFloat(b.stock));
      setAllProducts(sortedProducts);
    } else {
      toast({
        title: 'Error al cargar inventario',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
    setLoadingInventory(false);
  };

  const loadBusinessSettings = async () => {
    const result = await settingsService.getBusinessSettings();
    if (result.success) {
      setBusinessInfo({
        name: result.data.business_name,
        branch: result.data.branch_name,
        address: result.data.address,
        phone: result.data.phone,
        website: result.data.website,
      });
    } else {
      // Si falla, usar configuración por defecto
      setBusinessInfo({
        name: 'RESTAURANTE PIKA',
        branch: 'Sucursal UDABOL',
        address: 'UDABOL, Santa Cruz Bolivia',
        phone: '755-60-845',
        website: 'www.restaurantepika.com',
      });
    }
  };

  const loadOpenCashRegisters = async () => {
    const result = await cashRegisterService.getAllCashRegisters();
    if (result.success) {
      // Filtrar solo las cajas abiertas
      const openRegisters = result.data.filter((cr) => cr.status === 'open');
      setOpenCashRegisters(openRegisters);

      // Si hay al menos una caja abierta, seleccionarla automáticamente
      if (openRegisters.length > 0) {
        setSelectedCashRegister(openRegisters[0].id);
      }
    } else {
      toast({
        title: 'Error al cargar cajas',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openProductModal = () => {
    // Validar que haya una caja seleccionada
    if (!selectedCashRegister) {
      toast({
        title: 'No hay caja seleccionada',
        description: 'Debe seleccionar una caja abierta antes de agregar productos',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Validar que haya productos activos con stock
    if (!hasProducts) {
      toast({
        title: 'No hay productos disponibles',
        description: 'Debe tener al menos un producto activo con stock disponible para poder realizar ventas',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setSelectedProduct(null);
    setSelectedPromotion(null);
    setQuantity('');
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
    setSelectedPromotion(null);
    setQuantity('');
  };

  const handleAddToCart = () => {
    // Validar que se haya seleccionado algo
    if ((!selectedProduct && !selectedPromotion) || !quantity || parseFloat(quantity) <= 0) {
      toast({
        title: 'Datos incompletos',
        description: 'Seleccione un producto o promoción y cantidad válida',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const qty = parseFloat(quantity);

    // Si es una promoción
    if (selectedPromotion) {
      // Las promociones siempre tienen cantidad 1
      if (qty !== 1) {
        toast({
          title: 'Cantidad inválida',
          description: 'Las promociones solo se pueden agregar con cantidad 1',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        position: "top-right",
        });
        return;
      }

      const existingItem = cart.find((item) => item.promotion_id === selectedPromotion.id);
      if (existingItem) {
        toast({
          title: 'Promoción ya agregada',
          description: 'Esta promoción ya está en el carrito',
          status: 'warning',
          duration: 2000,
          isClosable: true,
        position: "top-right",
        });
        return;
      }

      const price = selectedPromotion.promotion_type === 'combo'
        ? parseFloat(selectedPromotion.combo_price)
        : parseFloat(selectedPromotion.product.price) * (1 - parseFloat(selectedPromotion.discount_percentage) / 100);

      setCart([
        ...cart,
        {
          promotion_id: selectedPromotion.id,
          product_id: selectedPromotion.product.id,
          product_name: `${selectedPromotion.name} (${selectedPromotion.promotion_type === 'combo' ? 'Combo' : 'Descuento'})`,
          product_code: `PROMO-${selectedPromotion.product.code}`,
          quantity: 1,
          unit_price: price,
          is_promotion: true,
        },
      ]);

      closeProductModal();
      return;
    }

    // Si es un producto normal
    if (qty > parseFloat(selectedProduct.stock)) {
      toast({
        title: 'Stock insuficiente',
        description: `Solo hay ${selectedProduct.stock} unidades disponibles`,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Extraer el ID real del producto (puede ser un ID compuesto con promoción)
    const realProductId = selectedProduct._originalProductId || selectedProduct.id.split('_promo_')[0] || selectedProduct.id;
    const isPromotionProduct = selectedProduct.promotion && selectedProduct.promotion.is_active;

    // Para productos con promoción, usar el precio final
    const productPrice = isPromotionProduct && selectedProduct.final_price
      ? parseFloat(selectedProduct.final_price)
      : parseFloat(selectedProduct.price);

    const productName = isPromotionProduct
      ? `${selectedProduct.name} - ${selectedProduct.promotion.name}`
      : selectedProduct.name;

    const existingItem = cart.find((item) => item.product_id === realProductId && item.product_name === productName);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === realProductId && item.product_name === productName
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: realProductId,
          product_name: productName,
          product_code: selectedProduct.code,
          quantity: qty,
          unit_price: productPrice,
          is_promotion: isPromotionProduct,
          promotion_info: isPromotionProduct ? selectedProduct.promotion : null,
        },
      ]);
    }

    closeProductModal();
  };

  const handleRemoveFromCart = (productId, productName) => {
    setCart(cart.filter((item) => !(item.product_id === productId && item.product_name === productName)));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    return Math.max(0, subtotal - discount);
  };

  /**
   * FUNCIÓN: createOrderFromSale
   *
   * Crea automáticamente un pedido en el sistema de cocina después de registrar una venta.
   *
   * FLUJO:
   * 1. Recibe los datos de la venta creada (con sale.id)
   * 2. Obtiene los productos/promociones del carrito para obtener preparationTime
   * 3. Construye los detalles del pedido con información de preparación
   * 4. Llama a orderService.createOrder() → POST /orders
   * 5. El pedido queda en estado 'pending' esperando ser recepcionado por el cocinero
   *
   * @param {Object} sale - Datos de la venta creada (incluye sale.id, sale_number, etc.)
   */
  const createOrderFromSale = async (sale) => {
    try {
      // Validar que el usuario esté autenticado
      if (!user || !user.id) {
        console.warn('No se puede crear pedido: usuario no autenticado');
        return;
      }

      // Construir detalles del pedido con información de preparación
      const orderDetails = cart.map((item) => {
        let preparationTime = 5; // Tiempo por defecto
        let itemType = 'product';

        // Determinar si es promoción basado en el flag is_promotion
        if (item.is_promotion) {
          itemType = 'promotion';
          preparationTime = 10; // Tiempo por defecto para promociones

          // Intentar obtener tiempo real de la promoción
          const promo = promotions.find(p => p.id === item.promotion_id);
          if (promo && promo.preparationTime) {
            preparationTime = promo.preparationTime;
          }
        } else {
          // Es un producto regular
          preparationTime = 5; // Tiempo por defecto para productos

          // Intentar obtener tiempo real del producto
          const product = allProducts.find(p => p.id === item.product_id);
          if (product && product.preparationTime) {
            preparationTime = product.preparationTime;
          }
        }

        return {
          type: itemType,
          productId: itemType === 'product' ? item.product_id : null,
          promotionId: itemType === 'promotion' ? item.promotion_id : null,
          name: item.product_name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          subtotal: parseFloat(item.unit_price) * item.quantity,
          preparationTime,
        };
      });

      // Crear el pedido
      // Generar notas con nombres de productos
      const productNames = cart.map(item => `${item.quantity}x ${item.product_name}`).join(', ');
      const orderNotes = formData.notes || productNames;

      const orderData = {
        saleId: sale.id,
        sellerId: user.id,
        details: orderDetails,
        notes: orderNotes,
      };

      console.log('Creando pedido con datos:', orderData); // Para debug

      const orderResult = await orderService.createOrder(orderData);

      if (orderResult.success) {
        console.log('✅ Pedido creado exitosamente:', orderResult.data);
      } else {
        console.error('❌ Error al crear pedido:', orderResult.error);
      }
    } catch (error) {
      console.error('❌ Error al crear pedido desde venta:', error);
    }
  };

  /**
   * FUNCIÓN: handleSubmit
   *
   * Maneja el envío del formulario de registro de venta.
   *
   * FLUJO DE SECUENCIA:
   * 1. Valida que el carrito no esté vacío
   * 2. Construye el objeto saleData con información de cliente y productos
   * 3. Llama a salesService.createSale(saleData) → POST /sales
   * 4. Backend:
   *    - Crea registro de venta en tabla sales
   *    - Actualiza stock de productos
   *    - Registra movimientos de inventario
   *    - Registra actividad en activity_log
   * 5. Frontend recibe respuesta con datos de venta creada (sale_number, total, etc.)
   * 6. LÓGICA DE MÉTODOS DE PAGO:
   *    - 'efectivo', 'tarjeta', 'transferencia': Venta confirmada, resetear formulario
   *    - 'qr': Abrir modal QR con código para escanear
   *    - 'paypal': Abrir modal PayPal con flujo de email (input → sending → waiting → confirmed)
   *    - 'stripe': Abrir modal Stripe con flujo de teléfono (input → sending → waiting → confirmed)
   *
   * IMPORTANTE: La venta YA está registrada en la BD cuando se llega al paso 5.
   * Los modales de pago digital son para CONFIRMAR/VERIFICAR el pago, no para crearlo.
   *
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCashRegister) {
      toast({
        title: 'No hay caja seleccionada',
        description: 'Debe seleccionar una caja abierta para realizar la venta',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agregue al menos un producto a la venta',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const saleData = {
      customer_name: formData.customer_name || null,
      customer_nit: formData.customer_nit || null,
      discount: parseFloat(formData.discount) || 0,
      payment_method: formData.payment_method,
      notes: formData.notes || null,
      cash_register_id: selectedCashRegister,
      created_by_id: user?.id || null,
      details: cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        custom_code: item.is_promotion ? item.product_code : undefined,
        custom_name: item.is_promotion ? item.product_name : undefined,
      })),
    };

    const result = await salesService.createSale(saleData);

    if (result.success) {
      // Crear pedido automáticamente después de la venta
      await createOrderFromSale(result.data);

      // Si el método de pago es QR, mostrar modal con QR
      if (formData.payment_method === 'qr') {
        setSaleInfo(result.data);
        setIsQRModalOpen(true);
      } else if (formData.payment_method === 'paypal') {
        // Mostrar modal de PayPal
        setSaleInfo(result.data);
        setIsPayPalModalOpen(true);
      } else if (formData.payment_method === 'stripe') {
        // Mostrar modal de Stripe
        setSaleInfo(result.data);
        setIsStripeModalOpen(true);
      } else {
        toast({
          title: 'Venta registrada',
          description: `Venta ${result.data.sale_number} registrada exitosamente. Pedido enviado a cocina.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        position: "top-right",
        });

        // Guardar información de la venta y mostrar ticket
        setSaleInfo(result.data);
        setIsTicketModalOpen(true);
        loadSalesHistory();
      }
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_nit: '',
      discount: 0,
      payment_method: 'efectivo',
      notes: '',
    });
    setCart([]);
    loadProducts();
    loadInventory();
  };

  /**
   * FUNCIÓN: closeTicketModal
   *
   * Cierra el modal del ticket y resetea el formulario.
   */
  const closeTicketModal = () => {
    setIsTicketModalOpen(false);
    setSaleInfo(null);
    resetForm();
  };

  /**
   * FUNCIÓN: closeQRModal
   *
   * Cierra el modal de pago con QR y confirma la venta.
   *
   * FLUJO:
   * 1. Muestra toast de confirmación con número de venta
   * 2. Cierra el modal (setIsQRModalOpen(false))
   * 3. Limpia la información de venta (setSaleInfo(null))
   * 4. Resetea el formulario (cart, formData, etc.)
   * 5. Recarga el historial de ventas actualizado
   *
   * NOTA: La venta ya está registrada en la BD. Este cierre solo confirma
   * que el cliente escaneó el código QR y completó el pago.
   */
  const closeQRModal = () => {
    // Mostrar mensaje de confirmación antes de cerrar
    if (saleInfo) {
      toast({
        title: 'Venta registrada',
        description: `Venta ${saleInfo.sale_number} registrada exitosamente por QR`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }

    setIsQRModalOpen(false);
    // Mostrar ticket después de cerrar modal de QR
    setIsTicketModalOpen(true);
    loadSalesHistory();
  };

  /**
   * FUNCIÓN: closePayPalModal
   *
   * Cierra el modal de pago con PayPal y confirma la venta.
   *
   * FLUJO:
   * 1. Si paypalStatus === 'confirmed': Muestra toast de confirmación
   * 2. Cierra el modal (setIsPayPalModalOpen(false))
   * 3. Limpia los estados de PayPal (email, status)
   * 4. Resetea el formulario (cart, formData, etc.)
   * 5. Recarga el historial de ventas actualizado
   *
   * ESTADOS DE PAYPAL:
   * - 'input': Usuario ingresando email
   * - 'sending': Enviando solicitud de pago
   * - 'waiting': Esperando confirmación del cliente en app de PayPal
   * - 'confirmed': Cliente confirmó el pago → Permitir cierre
   *
   * NOTA: Solo muestra confirmación si el estado es 'confirmed'
   */
  const closePayPalModal = () => {
    // Mostrar mensaje de confirmación antes de cerrar
    if (saleInfo && paypalStatus === 'confirmed') {
      toast({
        title: 'Venta registrada',
        description: `Venta ${saleInfo.sale_number} registrada exitosamente con PayPal`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }

    setIsPayPalModalOpen(false);
    setPaypalEmail('');
    setPaypalStatus('input');
    // Mostrar ticket después de cerrar modal de PayPal
    setIsTicketModalOpen(true);
    loadSalesHistory();
  };

  /**
   * FUNCIÓN: handleSendPayPalEmail
   *
   * Simula el envío de solicitud de pago a PayPal por correo electrónico.
   *
   * FLUJO DE ESTADOS (SIMULADO):
   * 1. 'input' → 'sending' (2 segundos)
   *    - Valida email (debe contener '@')
   *    - Muestra toast "Enviando solicitud..."
   *
   * 2. 'sending' → 'waiting' (después de 2 segundos)
   *    - Simula que se envió notificación a la app de PayPal del cliente
   *    - Muestra toast "Solicitud enviada, esperando confirmación..."
   *
   * 3. 'waiting' → 'confirmed' (después de 4 segundos)
   *    - Simula que el cliente confirmó el pago en su app móvil de PayPal
   *    - Muestra toast "Pago confirmado"
   *    - Botón de cierre del modal se habilita en verde
   *
   * IMPLEMENTACIÓN REAL (futuro):
   * - Integrar con PayPal API para enviar solicitudes de pago reales
   * - Usar webhooks para recibir confirmaciones de pago
   * - Validar email con PayPal antes de enviar
   *
   * @requires paypalEmail - Email del cliente registrado en PayPal
   */
  const handleSendPayPalEmail = () => {
    // Validar email
    if (!paypalEmail || !paypalEmail.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor ingrese un correo electrónico válido',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Simular envío
    setPaypalStatus('sending');

    toast({
      title: 'Enviando solicitud',
      description: `Enviando solicitud de pago a ${paypalEmail}...`,
      status: 'info',
      duration: 2000,
      isClosable: true,
        position: "top-right",
    });

    // Simular tiempo de envío
    setTimeout(() => {
      setPaypalStatus('waiting');
      toast({
        title: 'Solicitud enviada',
        description: 'Esperando confirmación del cliente en su app de PayPal',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      // Simular confirmación automática después de 4 segundos
      setTimeout(() => {
        setPaypalStatus('confirmed');
        toast({
          title: 'Pago confirmado',
          description: 'El cliente ha confirmado el pago en su app de PayPal',
          status: 'success',
          duration: 4000,
          isClosable: true,
        position: "top-right",
        });
      }, 4000);
    }, 2000);
  };

  /**
   * FUNCIÓN: closeStripeModal
   *
   * Cierra el modal de pago con Stripe y confirma la venta.
   *
   * FLUJO:
   * 1. Si stripeStatus === 'confirmed': Muestra toast de confirmación
   * 2. Cierra el modal (setIsStripeModalOpen(false))
   * 3. Limpia los estados de Stripe (phone, method, status)
   * 4. Resetea el formulario (cart, formData, etc.)
   * 5. Recarga el historial de ventas actualizado
   *
   * ESTADOS DE STRIPE:
   * - 'input': Usuario ingresando teléfono y seleccionando método (WhatsApp/SMS)
   * - 'sending': Enviando vínculo de pago por WhatsApp o SMS
   * - 'waiting': Cliente recibió vínculo, esperando que complete pago
   * - 'confirmed': Cliente completó el pago con Stripe → Permitir cierre
   *
   * NOTA: Solo muestra confirmación si el estado es 'confirmed'
   */
  const closeStripeModal = () => {
    // Mostrar mensaje de confirmación antes de cerrar
    if (saleInfo && stripeStatus === 'confirmed') {
      toast({
        title: 'Venta registrada',
        description: `Venta ${saleInfo.sale_number} registrada exitosamente con Stripe`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }

    setIsStripeModalOpen(false);
    setStripePhone('');
    setStripeMethod('whatsapp');
    setStripeStatus('input');
    // Mostrar ticket después de cerrar modal de Stripe
    setIsTicketModalOpen(true);
    loadSalesHistory();
  };

  /**
   * FUNCIÓN: handleSendStripeLink
   *
   * Simula el envío de vínculo de pago de Stripe por WhatsApp o SMS.
   *
   * FLUJO DE ESTADOS (SIMULADO):
   * 1. 'input' → 'sending' (2 segundos)
   *    - Valida teléfono (mínimo 8 dígitos)
   *    - Determina método: 'whatsapp' o 'sms'
   *    - Muestra toast "Enviando vínculo por WhatsApp/SMS..."
   *
   * 2. 'sending' → 'waiting' (después de 2 segundos)
   *    - Simula que se envió vínculo de pago al teléfono del cliente
   *    - Muestra URL de ejemplo: https://pay.stripe.com/demo/{sale_number}
   *    - Muestra toast "Vínculo enviado, esperando que el cliente complete el pago..."
   *
   * 3. 'waiting' → 'confirmed' (después de 5 segundos)
   *    - Simula que el cliente abrió el vínculo e ingresó datos de tarjeta
   *    - Stripe procesó el pago exitosamente
   *    - Muestra toast "Pago confirmado"
   *    - Botón de cierre del modal se habilita en verde
   *
   * IMPLEMENTACIÓN REAL (futuro):
   * - Integrar con Stripe API para crear Payment Links reales
   * - Enviar SMS/WhatsApp mediante servicios como Twilio o WhatsApp Business API
   * - Usar webhooks de Stripe para recibir confirmaciones de pago
   * - Validar número de teléfono con Stripe antes de enviar
   *
   * @requires stripePhone - Número de teléfono con código de país (ej: 591XXXXXXXX)
   * @requires stripeMethod - 'whatsapp' o 'sms'
   */
  const handleSendStripeLink = () => {
    // Validar número de teléfono (mínimo 8 dígitos)
    if (!stripePhone || stripePhone.length < 8) {
      toast({
        title: 'Número inválido',
        description: 'Por favor ingrese un número de teléfono válido',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Simular envío
    setStripeStatus('sending');

    const methodName = stripeMethod === 'whatsapp' ? 'WhatsApp' : 'SMS';
    toast({
      title: 'Enviando vínculo',
      description: `Enviando vínculo de pago por ${methodName} a +${stripePhone}...`,
      status: 'info',
      duration: 2000,
      isClosable: true,
        position: "top-right",
    });

    // Simular tiempo de envío
    setTimeout(() => {
      setStripeStatus('waiting');
      toast({
        title: 'Vínculo enviado',
        description: `El cliente ha recibido el vínculo por ${methodName}`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      // Simular confirmación automática después de 5 segundos
      setTimeout(() => {
        setStripeStatus('confirmed');
        toast({
          title: 'Pago confirmado',
          description: 'El cliente ha completado el pago con Stripe',
          status: 'success',
          duration: 4000,
          isClosable: true,
        position: "top-right",
        });
      }, 5000);
    }, 2000);
  };

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <form onSubmit={handleSubmit}>
        <Grid templateColumns={{ sm: '1fr', lg: '2fr 1fr' }} gap='22px'>
          {/* Carrito */}
          <Card>
            <CardHeader p='12px 5px'>
              <Flex justify='space-between' align='center'>
                <Text fontSize='xl' color={textColor} fontWeight='bold'>
                  Carrito de Venta
                </Text>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme='blue'
                  size='sm'
                  onClick={openProductModal}>
                  Agregar Producto
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              {!hasProducts && (
                <Alert status='warning' mb='20px' borderRadius='15px'>
                  <AlertIcon />
                  <AlertDescription>
                    No puede realizar ventas sin tener productos activos con stock disponible.
                    Por favor, asegúrese de tener al menos un producto activo con stock.
                  </AlertDescription>
                </Alert>
              )}
              {cart.length === 0 ? (
                <Box p={4} bg='blue.50' borderRadius='md'>
                  <Text color='blue.800'>
                    No hay productos en el carrito. Haga click en "Agregar Producto"
                  </Text>
                </Box>
              ) : (
                <Table variant='simple' size='sm' color={textColor}>
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor}>Código</Th>
                      <Th borderColor={borderColor}>Producto</Th>
                      <Th borderColor={borderColor}>Cantidad</Th>
                      <Th borderColor={borderColor}>Precio Unit.</Th>
                      <Th borderColor={borderColor}>Subtotal</Th>
                      <Th borderColor={borderColor}></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {cart.map((item, index) => (
                      <Tr key={`${item.product_id}_${item.product_name}_${index}`}>
                        <Td borderColor={borderColor}>{item.product_code}</Td>
                        <Td borderColor={borderColor}>{item.product_name}</Td>
                        <Td borderColor={borderColor}>{item.quantity}</Td>
                        <Td borderColor={borderColor}>Bs. {item.unit_price.toFixed(2)}</Td>
                        <Td borderColor={borderColor}>
                          Bs. {(item.quantity * item.unit_price).toFixed(2)}
                        </Td>
                        <Td borderColor={borderColor}>
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme='red'
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemoveFromCart(item.product_id, item.product_name)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </CardBody>
          </Card>

          {/* Resumen y datos del cliente */}
          <Flex direction='column' gap='22px'>
            {/* Resumen */}
            <Card>
              <CardHeader p='12px 5px'>
                <Text fontSize='lg' color={textColor} fontWeight='bold'>
                  Resumen
                </Text>
              </CardHeader>
              <CardBody>
                <Flex direction='column' gap='15px'>
                  {/* Selector de Caja */}
                  <FormControl isRequired>
                    <FormLabel fontSize='sm'>Caja Abierta</FormLabel>
                    {openCashRegisters.length === 0 ? (
                      <Alert status='warning' size='sm' borderRadius='md'>
                        <AlertIcon />
                        <AlertDescription fontSize='xs'>
                          No hay cajas abiertas. Debe abrir una caja para realizar ventas.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Select
                        value={selectedCashRegister || ''}
                        onChange={(e) => setSelectedCashRegister(e.target.value)}
                        size='sm'
                        bg={inputBg}
                        color={inputTextColor}>
                        {openCashRegisters.map((cashRegister) => (
                          <option key={cashRegister.id} value={cashRegister.id}>
                            {cashRegister.name || `Caja #${cashRegister.id}`}
                          </option>
                        ))}
                      </Select>
                    )}
                  </FormControl>

                  <Flex justify='space-between'>
                    <Text fontSize='sm'>Subtotal:</Text>
                    <Text fontSize='sm' fontWeight='bold'>
                      Bs. {calculateSubtotal().toFixed(2)}
                    </Text>
                  </Flex>
                  <FormControl>
                    <FormLabel fontSize='sm'>Descuento (Bs.)</FormLabel>
                    <Input
                      type='number'
                      name='discount'
                      value={formData.discount}
                      onChange={handleChange}
                      step='0.01'
                      min='0'
                      size='sm'
                      bg={inputBg}
                      color={inputTextColor}
                    />
                  </FormControl>
                  <Box borderTop='1px' borderColor={borderColor} pt={3}>
                    <Flex justify='space-between'>
                      <Text fontSize='lg' fontWeight='bold'>
                        Total:
                      </Text>
                      <Text fontSize='xl' fontWeight='bold' color='blue.500'>
                        Bs. {calculateTotal().toFixed(2)}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </CardBody>
            </Card>

            {/* Datos del cliente */}
            <Card>
              <CardHeader p='12px 5px'>
                <Text fontSize='lg' color={textColor} fontWeight='bold'>
                  Datos del Cliente
                </Text>
              </CardHeader>
              <CardBody>
                <Flex direction='column' gap='15px'>
                  <FormControl>
                    <FormLabel fontSize='sm'>Nombre</FormLabel>
                    <Input
                      name='customer_name'
                      value={formData.customer_name}
                      onChange={handleChange}
                      size='sm'
                      placeholder='Opcional'
                      bg={inputBg}
                      color={inputTextColor}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize='sm'>NIT / CI</FormLabel>
                    <Input
                      name='customer_nit'
                      value={formData.customer_nit}
                      onChange={handleChange}
                      size='sm'
                      placeholder='Opcional'
                      bg={inputBg}
                      color={inputTextColor}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize='sm'>Método de Pago</FormLabel>
                    <Select
                      name='payment_method'
                      value={formData.payment_method}
                      onChange={handleChange}
                      size='sm'
                      bg={inputBg}
                      color={inputTextColor}>
                      <option value='efectivo'>Efectivo</option>
                      {/* <option value='tarjeta'>Tarjeta</option> */}
                      {/* <option value='transferencia'>Transferencia</option> */}
                      <option value='qr'>QR</option>
                      <option value='paypal'>PayPal</option>
                      <option value='stripe'>Stripe</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize='sm'>Notas</FormLabel>
                    <Input
                      name='notes'
                      value={formData.notes}
                      onChange={handleChange}
                      size='sm'
                      placeholder='Opcional'
                      bg={inputBg}
                      color={inputTextColor}
                    />
                  </FormControl>
                  <Button
                    type='submit'
                    colorScheme='green'
                    size='lg'
                    width='full'
                    isDisabled={cart.length === 0}>
                    Registrar Venta
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </Flex>
        </Grid>
      </form>

      {/* Historial de Ventas */}
      <Card mt='22px'>
        <CardHeader p='12px 5px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Historial de Ventas (Últimas 10)
          </Text>
        </CardHeader>
        <CardBody>
          {loadingHistory ? (
            <Box p={4} textAlign='center'>
              <Text color='gray.500'>Cargando historial...</Text>
            </Box>
          ) : salesHistory.length === 0 ? (
            <Box p={4} bg='gray.50' borderRadius='md'>
              <Text color='gray.600'>No hay ventas registradas aún.</Text>
            </Box>
          ) : (
            <Box overflowX='auto'>
              <Table variant='simple' size='sm' color={textColor}>
                <Thead>
                  <Tr>
                    <Th borderColor={borderColor}>N° Venta</Th>
                    <Th borderColor={borderColor}>Fecha</Th>
                    <Th borderColor={borderColor}>Cliente</Th>
                    <Th borderColor={borderColor}>Caja Abierta</Th>
                    <Th borderColor={borderColor}>Total (Bs.)</Th>
                    <Th borderColor={borderColor}>Stock Actual</Th>
                    <Th borderColor={borderColor}>Método de Pago</Th>
                    <Th borderColor={borderColor}>Estado</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {salesHistory.map((sale) => (
                    <Tr key={sale.id}>
                      <Td borderColor={borderColor} fontWeight='bold'>
                        {sale.sale_number}
                      </Td>
                      <Td borderColor={borderColor}>
                        {new Date(sale.created_at).toLocaleString('es-BO', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Td>
                      <Td borderColor={borderColor}>
                        {sale.customer_name || 'Sin nombre'}
                      </Td>
                      <Td borderColor={borderColor}>
                        {sale.cash_register?.name || 'N/A'}
                      </Td>
                      <Td borderColor={borderColor} fontWeight='semibold'>
                        Bs. {parseFloat(sale.total).toFixed(2)}
                      </Td>
                      <Td borderColor={borderColor}>
                        {sale.details && sale.details.length > 0 ? (
                          <Box>
                            {sale.details.map((detail, idx) => (
                              <Text key={idx} fontSize='xs' color={textColor}>
                                {detail.custom_name || detail.product?.name || 'Producto'}:
                                <Text as='span' fontWeight='bold' color='blue.400' ml={1}>
                                  {detail.product?.stock != null ? parseFloat(detail.product.stock).toFixed(2) : 'N/A'}
                                </Text>
                              </Text>
                            ))}
                          </Box>
                        ) : (
                          <Text fontSize='xs' color={useColorModeValue('gray.500', 'gray.400')}>Sin detalles</Text>
                        )}
                      </Td>
                      <Td borderColor={borderColor}>
                        {sale.payment_method === 'efectivo' && 'Efectivo'}
                        {sale.payment_method === 'qr' && 'QR'}
                        {sale.payment_method === 'tarjeta' && 'Tarjeta'}
                        {sale.payment_method === 'transferencia' && 'Transferencia'}
                        {sale.payment_method === 'paypal' && 'PayPal'}
                        {sale.payment_method === 'stripe' && 'Stripe'}
                      </Td>
                      <Td borderColor={borderColor}>
                        {sale.is_active ? (
                          <Box
                            as='span'
                            px={2}
                            py={1}
                            borderRadius='md'
                            fontSize='xs'
                            fontWeight='bold'
                            bg='green.100'
                            color='green.700'>
                            Activa
                          </Box>
                        ) : (
                          <Box
                            as='span'
                            px={2}
                            py={1}
                            borderRadius='md'
                            fontSize='xs'
                            fontWeight='bold'
                            bg='red.100'
                            color='red.700'>
                            Anulada
                          </Box>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Estado del Inventario */}
      <Card mt='22px'>
        <CardHeader p='12px 5px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Estado del Inventario
          </Text>
        </CardHeader>
        <CardBody>
          {loadingInventory ? (
            <Box p={4} textAlign='center'>
              <Text color={useColorModeValue('gray.500', 'gray.400')}>Cargando inventario...</Text>
            </Box>
          ) : allProducts.length === 0 ? (
            <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius='md'>
              <Text color={useColorModeValue('gray.600', 'gray.300')}>No hay productos activos registrados.</Text>
            </Box>
          ) : (
            <Box overflowX='auto'>
              <Table variant='simple' size='sm' color={textColor}>
                <Thead>
                  <Tr>
                    <Th borderColor={borderColor}>Código</Th>
                    <Th borderColor={borderColor}>Producto</Th>
                    <Th borderColor={borderColor}>Stock Actual</Th>
                    <Th borderColor={borderColor}>Unidad</Th>
                    <Th borderColor={borderColor}>Precio (Bs.)</Th>
                    <Th borderColor={borderColor}>Estado</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {allProducts.map((product) => {
                    const stock = parseFloat(product.stock);
                    let stockStatus = 'normal';
                    let stockColor = useColorModeValue('green.700', 'green.300');
                    let stockBg = useColorModeValue('green.100', 'green.900');
                    let stockText = 'Disponible';

                    // Determinar el estado del stock
                    if (stock === 0) {
                      stockStatus = 'out';
                      stockColor = useColorModeValue('red.700', 'red.300');
                      stockBg = useColorModeValue('red.100', 'red.900');
                      stockText = 'Agotado';
                    } else if (stock <= 5) {
                      stockStatus = 'low';
                      stockColor = useColorModeValue('orange.700', 'orange.300');
                      stockBg = useColorModeValue('orange.100', 'orange.900');
                      stockText = 'Stock Bajo';
                    } else if (stock <= 10) {
                      stockStatus = 'medium';
                      stockColor = useColorModeValue('yellow.700', 'yellow.300');
                      stockBg = useColorModeValue('yellow.100', 'yellow.900');
                      stockText = 'Por Agotarse';
                    }

                    const rowBg = stock === 0
                      ? useColorModeValue('red.50', 'red.900')
                      : stock <= 5
                      ? useColorModeValue('orange.50', 'orange.900')
                      : useColorModeValue('white', 'gray.800');

                    return (
                      <Tr key={product.id} bg={rowBg}>
                        <Td borderColor={borderColor} fontWeight='semibold'>
                          {product.code}
                        </Td>
                        <Td borderColor={borderColor}>
                          {product.name}
                        </Td>
                        <Td borderColor={borderColor} fontWeight='bold' color={stockColor}>
                          {stock.toFixed(2)}
                        </Td>
                        <Td borderColor={borderColor}>
                          {product.unit}
                        </Td>
                        <Td borderColor={borderColor}>
                          Bs. {parseFloat(product.price).toFixed(2)}
                        </Td>
                        <Td borderColor={borderColor}>
                          <Box
                            as='span'
                            px={2}
                            py={1}
                            borderRadius='md'
                            fontSize='xs'
                            fontWeight='bold'
                            bg={stockBg}
                            color={stockColor}>
                            {stockText}
                          </Box>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Modal para agregar producto o promoción */}
      <Modal isOpen={isProductModalOpen} onClose={closeProductModal} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Agregar Producto o Promoción</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction='column' gap='20px'>
              {/* Sección de Promociones Activas */}
              {promotions.length > 0 && (
                <Box>
                  <Text fontSize='md' fontWeight='bold' mb={2} color={textColor}>
                    🎉 Promociones Activas
                  </Text>
                  <FormControl>
                    <Select
                      placeholder='Seleccione una promoción'
                      onChange={(e) => {
                        const promo = promotions.find((p) => p.id === e.target.value);
                        setSelectedPromotion(promo);
                        setSelectedProduct(null);
                        setQuantity('1'); // Las promociones siempre son cantidad 1
                      }}
                      bg={inputBg}
                      color={inputTextColor}
                      value={selectedPromotion?.id || ''}
                      isDisabled={!!selectedProduct}>
                      {promotions.map((promo) => {
                        const price = promo.promotion_type === 'combo'
                          ? parseFloat(promo.combo_price).toFixed(2)
                          : (parseFloat(promo.product.price) * (1 - parseFloat(promo.discount_percentage) / 100)).toFixed(2);
                        return (
                          <option key={promo.id} value={promo.id}>
                            {promo.name} - {promo.promotion_type === 'combo' ? 'COMBO' : `${promo.discount_percentage}% OFF`} - Bs. {price}
                          </option>
                        );
                      })}
                    </Select>
                  </FormControl>
                  {selectedPromotion && (
                    <Box p={3} bg='green.50' borderRadius='md' mt={2} border='2px solid' borderColor='green.200'>
                      <Text fontSize='sm' fontWeight='bold' color='green.700'>
                        {selectedPromotion.name}
                      </Text>
                      <Text fontSize='xs' color='green.600' mt={1}>
                        {selectedPromotion.description}
                      </Text>
                      <Text fontSize='sm' fontWeight='bold' color='green.700' mt={2}>
                        Precio: Bs. {selectedPromotion.promotion_type === 'combo'
                          ? parseFloat(selectedPromotion.combo_price).toFixed(2)
                          : (parseFloat(selectedPromotion.product.price) * (1 - parseFloat(selectedPromotion.discount_percentage) / 100)).toFixed(2)}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}

              {/* Separador */}
              {promotions.length > 0 && (
                <Box textAlign='center' position='relative'>
                  <Box position='absolute' top='50%' left='0' right='0' h='1px' bg={borderColor} />
                  <Text
                    as='span'
                    position='relative'
                    bg={inputBg}
                    px={3}
                    fontSize='sm'
                    color='gray.500'>
                    O
                  </Text>
                </Box>
              )}

              {/* Sección de Productos Regulares */}
              <Box>
                <Text fontSize='md' fontWeight='bold' mb={2} color={textColor}>
                  📦 Productos Regulares
                </Text>
                <FormControl>
                  <Select
                    placeholder='Seleccione un producto'
                    onChange={(e) => {
                      const product = products.find((p) => p.id === e.target.value);
                      setSelectedProduct(product);
                      setSelectedPromotion(null);
                      setQuantity('');
                    }}
                    bg={inputBg}
                    color={inputTextColor}
                    value={selectedProduct?.id || ''}
                    isDisabled={!!selectedPromotion}>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.code} - {product.name} (Stock: {product.stock}) - Bs. {product.price}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {selectedProduct && (
                  <Box p={3} bg='blue.50' borderRadius='md' mt={2}>
                    <Text fontSize='sm' color='blue.800'>
                      <strong>Stock disponible:</strong> {selectedProduct.stock}
                    </Text>
                    <Text fontSize='sm' color='blue.800'>
                      <strong>Precio:</strong> Bs. {selectedProduct.price}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Campo de Cantidad */}
              <FormControl isRequired>
                <FormLabel>Cantidad</FormLabel>
                <Input
                  type='number'
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  step='0.01'
                  min='0.01'
                  placeholder='0.00'
                  bg={inputBg}
                  color={inputTextColor}
                  isReadOnly={!!selectedPromotion} // Solo lectura si es promoción
                />
                {selectedPromotion && (
                  <Text fontSize='xs' color='gray.500' mt={1}>
                    Las promociones solo se pueden agregar con cantidad 1
                  </Text>
                )}
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={closeProductModal}>
              Cancelar
            </Button>
            <Button colorScheme='blue' onClick={handleAddToCart}>
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de QR para pago */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={closeQRModal}
        size='xl'
        closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pago con QR - Venta {saleInfo?.sale_number}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {saleInfo && (
              <Flex direction='column' align='center' gap='20px' py={4}>
                <Box p={4} bg='blue.50' borderRadius='md' width='full'>
                  <Text fontSize='lg' fontWeight='bold' textAlign='center' mb={2}>
                    Monto a Pagar
                  </Text>
                  <Text
                    fontSize='3xl'
                    fontWeight='bold'
                    color='green.500'
                    textAlign='center'>
                    Bs. {parseFloat(saleInfo.total).toFixed(2)}
                  </Text>
                </Box>

                <Box
                  p={6}
                  bg='white'
                  borderRadius='md'
                  boxShadow='lg'
                  border='2px solid'
                  borderColor='gray.200'>
                  <QRCodeSVG
                    value={JSON.stringify({
                      sale_number: saleInfo.sale_number,
                      total: parseFloat(saleInfo.total).toFixed(2),
                      currency: 'BOB',
                      customer: saleInfo.customer_name || 'Sin nombre',
                      timestamp: new Date().toISOString(),
                    })}
                    size={250}
                    level='H'
                    includeMargin={true}
                  />
                </Box>

                <Box p={4} bg='gray.50' borderRadius='md' width='full'>
                  <Text fontSize='sm' textAlign='center' color='gray.600'>
                    Escanee el código QR con su aplicación de pago
                  </Text>
                  <Text fontSize='xs' textAlign='center' color='gray.500' mt={2}>
                    Venta: {saleInfo.sale_number}
                  </Text>
                  {saleInfo.customer_name && (
                    <Text fontSize='xs' textAlign='center' color='gray.500'>
                      Cliente: {saleInfo.customer_name}
                    </Text>
                  )}
                </Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='green' onClick={closeQRModal} width='full'>
              Confirmar Pago y Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de PayPal para pago */}
      <Modal
        isOpen={isPayPalModalOpen}
        onClose={closePayPalModal}
        size='xl'
        closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pago con PayPal - Venta {saleInfo?.sale_number}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {saleInfo && (
              <Flex direction='column' align='center' gap='20px' py={4}>
                <Box p={4} bg='blue.50' borderRadius='md' width='full'>
                  <Text fontSize='lg' fontWeight='bold' textAlign='center' mb={2}>
                    Monto a Pagar
                  </Text>
                  <Text
                    fontSize='3xl'
                    fontWeight='bold'
                    color='blue.600'
                    textAlign='center'>
                    Bs. {parseFloat(saleInfo.total).toFixed(2)}
                  </Text>
                </Box>

                <Box
                  p={8}
                  bg='white'
                  borderRadius='md'
                  boxShadow='xl'
                  border='2px solid'
                  borderColor='blue.200'
                  width='full'>
                  <Flex direction='column' align='center' gap='20px'>
                    <Box
                      fontSize='6xl'
                      color='blue.600'
                      textAlign='center'>
                      💳
                    </Box>
                    <Text fontSize='2xl' fontWeight='bold' color='blue.600' textAlign='center'>
                      PayPal
                    </Text>

                    {/* Estado: Input - Ingreso de correo */}
                    {paypalStatus === 'input' && (
                      <>
                        <Text fontSize='md' textAlign='center' color='gray.600'>
                          Ingrese el correo electrónico del cliente registrado en PayPal
                        </Text>

                        <Box p={4} bg='blue.50' borderRadius='md' width='full'>
                          <Text fontSize='sm' fontWeight='bold' mb={2}>Detalles de la transacción:</Text>
                          <Flex justify='space-between' mb={1}>
                            <Text fontSize='sm' color='gray.600'>Venta:</Text>
                            <Text fontSize='sm' fontWeight='semibold'>{saleInfo.sale_number}</Text>
                          </Flex>
                          {saleInfo.customer_name && (
                            <Flex justify='space-between' mb={1}>
                              <Text fontSize='sm' color='gray.600'>Cliente:</Text>
                              <Text fontSize='sm' fontWeight='semibold'>{saleInfo.customer_name}</Text>
                            </Flex>
                          )}
                          <Flex justify='space-between'>
                            <Text fontSize='sm' color='gray.600'>Total:</Text>
                            <Text fontSize='sm' fontWeight='bold' color='blue.600'>
                              Bs. {parseFloat(saleInfo.total).toFixed(2)}
                            </Text>
                          </Flex>
                        </Box>

                        <FormControl isRequired width='full'>
                          <FormLabel fontSize='sm'>Correo electrónico de PayPal</FormLabel>
                          <Input
                            type='email'
                            placeholder='cliente@ejemplo.com'
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            size='lg'
                            bg={inputBg}
                            color={inputTextColor}
                          />
                        </FormControl>

                        <Button
                          colorScheme='blue'
                          size='lg'
                          width='full'
                          onClick={handleSendPayPalEmail}
                          isDisabled={!paypalEmail}>
                          Enviar solicitud de pago
                        </Button>
                      </>
                    )}

                    {/* Estado: Sending - Enviando solicitud */}
                    {paypalStatus === 'sending' && (
                      <>
                        <Box textAlign='center'>
                          <Text fontSize='lg' fontWeight='bold' color='blue.600' mb={3}>
                            Enviando solicitud...
                          </Text>
                          <Box fontSize='4xl' mb={3}>📧</Box>
                          <Text fontSize='sm' color='gray.600'>
                            Enviando solicitud de pago a:
                          </Text>
                          <Text fontSize='md' fontWeight='bold' color='blue.600'>
                            {paypalEmail}
                          </Text>
                        </Box>
                      </>
                    )}

                    {/* Estado: Waiting - Esperando confirmación */}
                    {paypalStatus === 'waiting' && (
                      <>
                        <Box textAlign='center'>
                          <Text fontSize='lg' fontWeight='bold' color='orange.600' mb={3}>
                            Esperando confirmación del cliente
                          </Text>
                          <Box fontSize='5xl' mb={3}>📱</Box>
                          <Text fontSize='sm' color='gray.600' mb={2}>
                            Se ha enviado una notificación a la app de PayPal del cliente
                          </Text>
                          <Text fontSize='md' fontWeight='semibold' color='orange.600'>
                            {paypalEmail}
                          </Text>
                        </Box>

                        <Alert status='warning' borderRadius='md'>
                          <AlertIcon />
                          <AlertDescription fontSize='sm'>
                            Por favor, solicite al cliente que confirme el pago en su aplicación móvil de PayPal
                          </AlertDescription>
                        </Alert>

                        <Box textAlign='center'>
                          <Text fontSize='xs' color='gray.500'>
                            Aguardando respuesta...
                          </Text>
                        </Box>
                      </>
                    )}

                    {/* Estado: Confirmed - Pago confirmado */}
                    {paypalStatus === 'confirmed' && (
                      <>
                        <Box textAlign='center'>
                          <Text fontSize='2xl' fontWeight='bold' color='green.600' mb={3}>
                            ¡Pago Validado!
                          </Text>
                          <Box fontSize='6xl' mb={3}>✅</Box>
                          <Text fontSize='md' color='gray.600' mb={2}>
                            El cliente ha confirmado el pago desde su app de PayPal
                          </Text>
                        </Box>

                        <Box p={4} bg='green.50' borderRadius='md' width='full' border='2px solid' borderColor='green.200'>
                          <Text fontSize='sm' fontWeight='bold' mb={2} color='green.700'>
                            Detalles del pago validado:
                          </Text>
                          <Flex justify='space-between' mb={1}>
                            <Text fontSize='sm' color='gray.600'>Correo PayPal:</Text>
                            <Text fontSize='sm' fontWeight='semibold'>{paypalEmail}</Text>
                          </Flex>
                          <Flex justify='space-between' mb={1}>
                            <Text fontSize='sm' color='gray.600'>Venta:</Text>
                            <Text fontSize='sm' fontWeight='semibold'>{saleInfo.sale_number}</Text>
                          </Flex>
                          <Flex justify='space-between' mb={1}>
                            <Text fontSize='sm' color='gray.600'>Monto:</Text>
                            <Text fontSize='sm' fontWeight='bold' color='green.600'>
                              Bs. {parseFloat(saleInfo.total).toFixed(2)}
                            </Text>
                          </Flex>
                          <Flex justify='space-between'>
                            <Text fontSize='sm' color='gray.600'>Estado:</Text>
                            <Text fontSize='sm' fontWeight='bold' color='green.600'>
                              Confirmado
                            </Text>
                          </Flex>
                        </Box>

                        <Alert status='success' borderRadius='md'>
                          <AlertIcon />
                          <AlertDescription fontSize='sm'>
                            El pago ha sido validado exitosamente. Puede proceder a confirmar la venta.
                          </AlertDescription>
                        </Alert>
                      </>
                    )}
                  </Flex>
                </Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            {paypalStatus === 'confirmed' ? (
              <Button colorScheme='green' onClick={closePayPalModal} width='full' size='lg'>
                Confirmar Pago con PayPal
              </Button>
            ) : (
              <Button variant='ghost' onClick={() => {
                setIsPayPalModalOpen(false);
                setPaypalEmail('');
                setPaypalStatus('input');
                // No resetear el formulario ni recargar historial si se cancela
              }} width='full'>
                Cancelar
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Stripe para pago */}
      <Modal
        isOpen={isStripeModalOpen}
        onClose={closeStripeModal}
        size='xl'
        closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pago con Stripe - Venta {saleInfo?.sale_number}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {saleInfo && (
              <Flex direction='column' align='center' gap='20px' py={4}>
                <Box p={4} bg='purple.50' borderRadius='md' width='full'>
                  <Text fontSize='lg' fontWeight='bold' textAlign='center' mb={2}>
                    Monto a Pagar
                  </Text>
                  <Text
                    fontSize='3xl'
                    fontWeight='bold'
                    color='purple.600'
                    textAlign='center'>
                    Bs. {parseFloat(saleInfo.total).toFixed(2)}
                  </Text>
                </Box>

                <Box
                  p={8}
                  bg='white'
                  borderRadius='md'
                  boxShadow='xl'
                  border='2px solid'
                  borderColor='purple.200'
                  width='full'>
                  <Flex direction='column' align='center' gap='20px'>
                    <Box
                      fontSize='6xl'
                      color='purple.600'
                      textAlign='center'>
                      💳
                    </Box>
                    <Text fontSize='2xl' fontWeight='bold' color='purple.600' textAlign='center'>
                      Stripe
                    </Text>

                    {/* Estado: Input - Ingreso de teléfono */}
                    {stripeStatus === 'input' && (
                      <>
                        <Text fontSize='md' textAlign='center' color='gray.600'>
                          Enviaremos un vínculo de pago seguro al teléfono del cliente
                        </Text>

                        <Box p={4} bg='purple.50' borderRadius='md' width='full'>
                          <Text fontSize='sm' fontWeight='bold' mb={2}>Detalles de la transacción:</Text>
                          <Flex justify='space-between' mb={1}>
                            <Text fontSize='sm' color='gray.600'>Venta:</Text>
                            <Text fontSize='sm' fontWeight='semibold'>{saleInfo.sale_number}</Text>
                          </Flex>
                          {saleInfo.customer_name && (
                            <Flex justify='space-between' mb={1}>
                              <Text fontSize='sm' color='gray.600'>Cliente:</Text>
                              <Text fontSize='sm' fontWeight='semibold'>{saleInfo.customer_name}</Text>
                            </Flex>
                          )}
                          <Flex justify='space-between'>
                            <Text fontSize='sm' color='gray.600'>Total:</Text>
                            <Text fontSize='sm' fontWeight='bold' color='purple.600'>
                              Bs. {parseFloat(saleInfo.total).toFixed(2)}
                            </Text>
                          </Flex>
                        </Box>

                        <FormControl isRequired width='full'>
                          <FormLabel fontSize='sm'>Método de envío</FormLabel>
                          <Select
                            value={stripeMethod}
                            onChange={(e) => setStripeMethod(e.target.value)}
                            size='lg'
                            bg={inputBg}
                            color={inputTextColor}>
                            <option value='whatsapp'>WhatsApp</option>
                            <option value='sms'>Mensaje de texto (SMS)</option>
                          </Select>
                        </FormControl>

                        <FormControl isRequired width='full'>
                          <FormLabel fontSize='sm'>Número de teléfono</FormLabel>
                          <Input
                            type='tel'
                            placeholder='591 XXXXXXXX'
                            value={stripePhone}
                            onChange={(e) => setStripePhone(e.target.value.replace(/\D/g, ''))}
                            size='lg'
                            bg={inputBg}
                            color={inputTextColor}
                          />
                          <Text fontSize='xs' color='gray.500' mt={1}>
                            Ingrese el número con código de país (ej: 591 para Bolivia)
                          </Text>
                        </FormControl>

                        <Button
                          colorScheme='purple'
                          size='lg'
                          width='full'
                          onClick={handleSendStripeLink}
                          isDisabled={!stripePhone || stripePhone.length < 8}>
                          Enviar vínculo de pago
                        </Button>
                      </>
                    )}

                    {/* Estado: Sending - Enviando vínculo */}
                    {stripeStatus === 'sending' && (
                      <>
                        <Box textAlign='center'>
                          <Text fontSize='lg' fontWeight='bold' color='purple.600' mb={3}>
                            Enviando vínculo...
                          </Text>
                          <Box fontSize='4xl' mb={3}>
                            {stripeMethod === 'whatsapp' ? '📱' : '💬'}
                          </Box>
                          <Text fontSize='sm' color='gray.600'>
                            Enviando por {stripeMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'} a:
                          </Text>
                          <Text fontSize='md' fontWeight='bold' color='purple.600'>
                            +{stripePhone}
                          </Text>
                        </Box>
                      </>
                    )}

                    {/* Estado: Waiting - Esperando confirmación */}
                    {stripeStatus === 'waiting' && (
                      <>
                        <Box textAlign='center'>
                          <Text fontSize='lg' fontWeight='bold' color='orange.600' mb={3}>
                            Esperando que el cliente complete el pago
                          </Text>
                          <Box fontSize='5xl' mb={3}>
                            {stripeMethod === 'whatsapp' ? '💬' : '📱'}
                          </Box>
                          <Text fontSize='sm' color='gray.600' mb={2}>
                            Se ha enviado el vínculo de pago por {stripeMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                          </Text>
                          <Text fontSize='md' fontWeight='semibold' color='orange.600'>
                            +{stripePhone}
                          </Text>
                        </Box>

                        <Box p={4} bg='purple.50' borderRadius='md' width='full'>
                          <Text fontSize='sm' fontWeight='bold' mb={2} color='purple.700'>
                            Vínculo de pago enviado:
                          </Text>
                          <Text fontSize='xs' color='gray.600' fontFamily='monospace' bg='white' p={2} borderRadius='md'>
                            https://pay.stripe.com/demo/{saleInfo.sale_number}
                          </Text>
                        </Box>

                        <Alert status='warning' borderRadius='md'>
                          <AlertIcon />
                          <AlertDescription fontSize='sm'>
                            El cliente debe abrir el vínculo en su dispositivo móvil e ingresar los datos de su tarjeta para completar el pago
                          </AlertDescription>
                        </Alert>

                        <Box textAlign='center'>
                          <Text fontSize='xs' color='gray.500'>
                            Aguardando confirmación de pago...
                          </Text>
                        </Box>
                      </>
                    )}

                    {/* Estado: Confirmed - Pago confirmado */}
                    {stripeStatus === 'confirmed' && (
                      <>
                        <Box textAlign='center'>
                          <Text fontSize='2xl' fontWeight='bold' color='green.600' mb={3}>
                            ¡Pago Realizado!
                          </Text>
                          <Box fontSize='6xl' mb={3}>✅</Box>
                          <Text fontSize='md' color='gray.600' mb={2}>
                            El cliente ha completado el pago exitosamente con Stripe
                          </Text>
                        </Box>

                        <Box p={4} bg='green.50' borderRadius='md' width='full' border='2px solid' borderColor='green.200'>
                          <Text fontSize='sm' fontWeight='bold' mb={2} color='green.700'>
                            Detalles del pago confirmado:
                          </Text>
                          <Flex justify='space-between' mb={1}>
                            <Text fontSize='sm' color='gray.600'>Teléfono:</Text>
                            <Text fontSize='sm' fontWeight='semibold'>+{stripePhone}</Text>
                          </Flex>
                          <Flex justify='space-between' mb={1}>
                            <Text fontSize='sm' color='gray.600'>Método:</Text>
                            <Text fontSize='sm' fontWeight='semibold'>
                              {stripeMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                            </Text>
                          </Flex>
                          <Flex justify='space-between' mb={1}>
                            <Text fontSize='sm' color='gray.600'>Venta:</Text>
                            <Text fontSize='sm' fontWeight='semibold'>{saleInfo.sale_number}</Text>
                          </Flex>
                          <Flex justify='space-between' mb={1}>
                            <Text fontSize='sm' color='gray.600'>Monto:</Text>
                            <Text fontSize='sm' fontWeight='bold' color='green.600'>
                              Bs. {parseFloat(saleInfo.total).toFixed(2)}
                            </Text>
                          </Flex>
                          <Flex justify='space-between'>
                            <Text fontSize='sm' color='gray.600'>Estado:</Text>
                            <Text fontSize='sm' fontWeight='bold' color='green.600'>
                              Pagado
                            </Text>
                          </Flex>
                        </Box>

                        <Alert status='success' borderRadius='md'>
                          <AlertIcon />
                          <AlertDescription fontSize='sm'>
                            El pago ha sido procesado exitosamente. Puede proceder a confirmar la venta.
                          </AlertDescription>
                        </Alert>
                      </>
                    )}
                  </Flex>
                </Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            {stripeStatus === 'confirmed' ? (
              <Button colorScheme='green' onClick={closeStripeModal} width='full' size='lg'>
                Confirmar Pago con Stripe
              </Button>
            ) : (
              <Button variant='ghost' onClick={() => {
                setIsStripeModalOpen(false);
                setStripePhone('');
                setStripeMethod('whatsapp');
                setStripeStatus('input');
                // No resetear el formulario ni recargar historial si se cancela
              }} width='full'>
                Cancelar
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Ticket de Venta */}
      <TicketReceipt
        isOpen={isTicketModalOpen}
        onClose={closeTicketModal}
        saleData={saleInfo}
        businessInfo={businessInfo}
      />
    </Flex>
  );
}

export default RegisterSale;
