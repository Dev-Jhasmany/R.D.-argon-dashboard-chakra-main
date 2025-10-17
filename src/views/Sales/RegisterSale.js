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
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { QRCodeSVG } from 'qrcode.react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import salesService from 'services/salesService';
import productService from 'services/productService';
import promotionService from 'services/promotionService';

function RegisterSale() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'white');
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [saleInfo, setSaleInfo] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [cart, setCart] = useState([]);

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
  }, []);

  const loadProducts = async () => {
    const result = await productService.getAllProducts();
    if (result.success) {
      const activeProducts = result.data.filter((p) => p.is_active && parseFloat(p.stock) > 0);
      setProducts(activeProducts);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const loadPromotions = async () => {
    const result = await promotionService.getActivePromotions();
    if (result.success) {
      // Filtrar solo las promociones que están activas y dentro del rango de fechas
      const now = new Date();
      const activePromos = result.data.filter((promo) => {
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);
        return promo.is_active && now >= startDate && now <= endDate;
      });
      setPromotions(activePromos);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openProductModal = () => {
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
      });
      return;
    }

    const existingItem = cart.find((item) => item.product_id === selectedProduct.id && !item.is_promotion);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === selectedProduct.id && !item.is_promotion
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          product_code: selectedProduct.code,
          quantity: qty,
          unit_price: parseFloat(selectedProduct.price),
          is_promotion: false,
        },
      ]);
    }

    closeProductModal();
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    return Math.max(0, subtotal - discount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agregue al menos un producto a la venta',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const saleData = {
      customer_name: formData.customer_name || null,
      customer_nit: formData.customer_nit || null,
      discount: parseFloat(formData.discount) || 0,
      payment_method: formData.payment_method,
      notes: formData.notes || null,
      details: cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    const result = await salesService.createSale(saleData);

    if (result.success) {
      // Si el método de pago es QR, mostrar modal con QR
      if (formData.payment_method === 'qr') {
        setSaleInfo(result.data);
        setIsQRModalOpen(true);
      } else {
        toast({
          title: 'Venta registrada',
          description: `Venta ${result.data.sale_number} registrada exitosamente`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Resetear formulario
        resetForm();
      }
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
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
  };

  const closeQRModal = () => {
    setIsQRModalOpen(false);
    setSaleInfo(null);
    resetForm();
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
                    {cart.map((item) => (
                      <Tr key={item.product_id}>
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
                            onClick={() => handleRemoveFromCart(item.product_id)}
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
                      value={selectedPromotion?.id || ''}>
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
                    value={selectedProduct?.id || ''}>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.code} - {product.name} (Stock: {product.stock}) - Bs. {product.price}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {selectedProduct && (
                  <Box p={3} bg='blue.50' borderRadius='md' mt={2}>
                    <Text fontSize='sm'>
                      <strong>Stock disponible:</strong> {selectedProduct.stock}
                    </Text>
                    <Text fontSize='sm'>
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
    </Flex>
  );
}

export default RegisterSale;
