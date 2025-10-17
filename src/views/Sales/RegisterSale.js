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

function RegisterSale() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [saleInfo, setSaleInfo] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openProductModal = () => {
    setSelectedProduct(null);
    setQuantity('');
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
    setQuantity('');
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
      toast({
        title: 'Datos incompletos',
        description: 'Seleccione un producto y cantidad válida',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const qty = parseFloat(quantity);
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

    const existingItem = cart.find((item) => item.product_id === selectedProduct.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === selectedProduct.id
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
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize='sm'>Método de Pago</FormLabel>
                    <Select
                      name='payment_method'
                      value={formData.payment_method}
                      onChange={handleChange}
                      size='sm'>
                      <option value='efectivo'>Efectivo</option>
                      <option value='tarjeta'>Tarjeta</option>
                      <option value='transferencia'>Transferencia</option>
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

      {/* Modal para agregar producto */}
      <Modal isOpen={isProductModalOpen} onClose={closeProductModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Agregar Producto</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction='column' gap='20px'>
              <FormControl isRequired>
                <FormLabel>Producto</FormLabel>
                <Select
                  placeholder='Seleccione un producto'
                  onChange={(e) => {
                    const product = products.find((p) => p.id === e.target.value);
                    setSelectedProduct(product);
                  }}>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name} (Stock: {product.stock}) - Bs.{' '}
                      {product.price}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {selectedProduct && (
                <Box p={3} bg='blue.50' borderRadius='md'>
                  <Text fontSize='sm'>
                    <strong>Stock disponible:</strong> {selectedProduct.stock}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Precio:</strong> Bs. {selectedProduct.price}
                  </Text>
                </Box>
              )}
              <FormControl isRequired>
                <FormLabel>Cantidad</FormLabel>
                <Input
                  type='number'
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  step='0.01'
                  min='0.01'
                  placeholder='0.00'
                />
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
