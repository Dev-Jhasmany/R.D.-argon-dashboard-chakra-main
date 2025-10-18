import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Table,
  Tbody,
  Td,
  Text,
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
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, ViewIcon } from '@chakra-ui/icons';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import stockMovementService from 'services/stockMovementService';
import productService from 'services/productService';

function StockControl() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'white');
  const toast = useToast();

  // Estados
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockLimit, setStockLimit] = useState(10); // Límite de stock bajo por defecto
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [productHistory, setProductHistory] = useState([]);
  const [movementType, setMovementType] = useState('');

  const [formData, setFormData] = useState({
    quantity: '',
    reason: '',
    notes: '',
  });

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const result = await productService.getAllProducts();
    if (result.success) {
      // Filtrar solo productos activos
      const activeProducts = result.data.filter((p) => p.is_active);
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
      calculateLowStock(activeProducts, stockLimit);
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

  // Calcular productos con stock bajo
  const calculateLowStock = (productsList = products, limit = stockLimit) => {
    const lowStock = productsList.filter(
      (product) => parseFloat(product.stock) <= parseFloat(limit) && parseFloat(product.stock) > 0
    );
    setLowStockProducts(lowStock);
  };

  // Manejar cambio de límite de stock
  const handleStockLimitChange = () => {
    if (stockLimit && stockLimit > 0) {
      calculateLowStock(products, stockLimit);
      toast({
        title: 'Límite actualizado',
        description: `Se han calculado ${lowStockProducts.length} productos con stock bajo`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    // Filtrar productos por código, nombre o categoría
    const filtered = products.filter(
      (product) =>
        product.code.toLowerCase().includes(value.toLowerCase()) ||
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const openMovementModal = (product, type) => {
    setSelectedProduct(product);
    setMovementType(type);
    setFormData({ quantity: '', reason: '', notes: '' });
    setIsMovementModalOpen(true);
  };

  const closeMovementModal = () => {
    setIsMovementModalOpen(false);
    setSelectedProduct(null);
    setMovementType('');
    setFormData({ quantity: '', reason: '', notes: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitMovement = async () => {
    // Validaciones
    if (!formData.quantity) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor ingrese la cantidad',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (quantity <= 0) {
      toast({
        title: 'Cantidad inválida',
        description: 'La cantidad debe ser mayor a 0',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const movementData = {
      product_id: selectedProduct.id,
      movement_type: movementType,
      quantity: quantity,
      reason: formData.reason || null,
      notes: formData.notes || null,
    };

    const result = await stockMovementService.createMovement(movementData);

    if (result.success) {
      toast({
        title: 'Movimiento registrado',
        description: `${movementType === 'entrada' ? 'Entrada' : 'Salida'} de stock registrada exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      closeMovementModal();
      loadProducts(); // Recargar productos para actualizar stock
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

  const openHistoryModal = async (product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);

    // Cargar historial del producto
    const result = await stockMovementService.getMovementsByProduct(product.id);
    if (result.success) {
      setProductHistory(result.data);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setProductHistory([]);
    }
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedProduct(null);
    setProductHistory([]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStockStatus = (stock) => {
    const stockNum = parseFloat(stock);
    if (stockNum === 0) {
      return <Badge colorScheme='red'>AGOTADO</Badge>;
    } else if (stockNum <= parseFloat(stockLimit)) {
      return <Badge colorScheme='orange'>BAJO</Badge>;
    } else {
      return <Badge colorScheme='green'>NORMAL</Badge>;
    }
  };

  const getMovementTypeBadge = (type) => {
    if (type === 'entrada') {
      return (
        <Badge colorScheme='green' fontSize='sm'>
          ENTRADA
        </Badge>
      );
    } else {
      return (
        <Badge colorScheme='red' fontSize='sm'>
          SALIDA
        </Badge>
      );
    }
  };

  // Componente reutilizable para tabla de productos
  const ProductsTable = ({ productsList, emptyMessage }) => (
    <Table variant='simple' color={textColor}>
      <Thead>
        <Tr>
          <Th borderColor={borderColor} color='gray.400'>
            Código
          </Th>
          <Th borderColor={borderColor} color='gray.400'>
            Producto
          </Th>
          <Th borderColor={borderColor} color='gray.400'>
            Categoría
          </Th>
          <Th borderColor={borderColor} color='gray.400'>
            Precio
          </Th>
          <Th borderColor={borderColor} color='gray.400'>
            Stock Actual
          </Th>
          <Th borderColor={borderColor} color='gray.400'>
            Estado
          </Th>
          <Th borderColor={borderColor} color='gray.400'>
            Acciones
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {productsList.length === 0 ? (
          <Tr>
            <Td colSpan={7} textAlign='center'>
              <Box p={4} bg='blue.50' borderRadius='md'>
                <Text color='blue.800'>{emptyMessage}</Text>
              </Box>
            </Td>
          </Tr>
        ) : (
          productsList.map((product) => (
            <Tr key={product.id}>
              <Td borderColor={borderColor}>
                <Text fontSize='sm' fontWeight='bold'>
                  {product.code}
                </Text>
              </Td>
              <Td borderColor={borderColor}>
                <Text fontSize='sm' fontWeight='bold'>
                  {product.name}
                </Text>
                {product.description && (
                  <Text fontSize='xs' color='gray.600'>
                    {product.description}
                  </Text>
                )}
              </Td>
              <Td borderColor={borderColor}>
                <Text fontSize='sm'>{product.category?.name}</Text>
              </Td>
              <Td borderColor={borderColor}>
                <Text fontSize='sm' fontWeight='bold'>
                  Bs. {product.price}
                </Text>
              </Td>
              <Td borderColor={borderColor}>
                <Text fontSize='lg' fontWeight='bold' color='blue.500'>
                  {product.stock}
                </Text>
              </Td>
              <Td borderColor={borderColor}>{getStockStatus(product.stock)}</Td>
              <Td borderColor={borderColor}>
                <Flex gap={2}>
                  <Tooltip label='Entrada de Stock'>
                    <IconButton
                      size='sm'
                      colorScheme='green'
                      icon={<AddIcon />}
                      onClick={() => openMovementModal(product, 'entrada')}
                    />
                  </Tooltip>
                  <Tooltip label='Salida de Stock'>
                    <IconButton
                      size='sm'
                      colorScheme='red'
                      icon={<MinusIcon />}
                      onClick={() => openMovementModal(product, 'salida')}
                    />
                  </Tooltip>
                  <Tooltip label='Ver Historial'>
                    <IconButton
                      size='sm'
                      colorScheme='blue'
                      variant='outline'
                      icon={<ViewIcon />}
                      onClick={() => openHistoryModal(product)}
                    />
                  </Tooltip>
                </Flex>
              </Td>
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }} gap={6}>
      {/* Card para configurar límite de stock bajo */}
      <Card>
        <CardHeader p='12px 5px'>
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
            Configuración de Stock Bajo
          </Text>
        </CardHeader>
        <CardBody>
          <Flex gap={4} align='end' flexWrap='wrap'>
            <FormControl maxW='200px'>
              <FormLabel fontSize='sm'>Límite de Stock Bajo</FormLabel>
              <Input
                type='number'
                value={stockLimit}
                onChange={(e) => setStockLimit(e.target.value)}
                min='1'
                step='1'
                bg={inputBg}
                color={inputTextColor}
              />
            </FormControl>
            <Button colorScheme='blue' onClick={handleStockLimitChange}>
              Calcular Stock Bajo
            </Button>
            <Badge colorScheme='orange' p='8px 16px' borderRadius='8px' fontSize='md'>
              {lowStockProducts.length} productos con stock bajo
            </Badge>
          </Flex>
        </CardBody>
      </Card>

      {/* Tabla de productos con stock bajo */}
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <CardHeader p='12px 5px'>
          <Flex justify='space-between' align='center' wrap='wrap' gap={4}>
            <Text fontSize='xl' color='orange.600' fontWeight='bold'>
              ⚠️ Productos con Stock Bajo (≤ {stockLimit})
            </Text>
            <Badge colorScheme='orange' p='6px 12px' borderRadius='8px'>
              {lowStockProducts.length} productos
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {products.length === 0 ? (
            <Box p={4} bg='orange.100' borderRadius='md'>
              <Text color='orange.800' fontWeight='bold'>
                ⚠️ No hay productos registrados. Por favor registre productos primero.
              </Text>
            </Box>
          ) : (
            <ProductsTable
              productsList={lowStockProducts}
              emptyMessage={`No hay productos con stock menor o igual a ${stockLimit}`}
            />
          )}
        </CardBody>
      </Card>

      {/* Tabla de todos los productos */}
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <CardHeader p='12px 5px'>
          <Flex justify='space-between' align='center' wrap='wrap' gap={4}>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Todos los Productos - Control de Stock
            </Text>
            <Flex gap={3} align='center' flexWrap='wrap'>
              <Box minW={{ base: '100%', md: '300px' }}>
                <Input
                  placeholder='Buscar por código, nombre o categoría...'
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size='md'
                  bg={inputBg}
                  color={inputTextColor}
                />
              </Box>
              <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
                {filteredProducts.length} productos
              </Badge>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody>
          {products.length === 0 ? (
            <Box p={4} bg='orange.100' borderRadius='md'>
              <Text color='orange.800' fontWeight='bold'>
                ⚠️ No hay productos registrados. Por favor registre productos primero.
              </Text>
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box p={4} bg='blue.50' borderRadius='md'>
              <Text color='blue.800'>
                No se encontraron productos con el término de búsqueda "{searchTerm}"
              </Text>
            </Box>
          ) : (
            <ProductsTable
              productsList={filteredProducts}
              emptyMessage='No hay productos disponibles'
            />
          )}
        </CardBody>
      </Card>

      {/* Modal para registrar movimiento */}
      <Modal isOpen={isMovementModalOpen} onClose={closeMovementModal} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {movementType === 'entrada' ? 'Entrada de Stock' : 'Salida de Stock'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProduct && (
              <Box mb={4} p={3} bg='blue.50' borderRadius='md'>
                <Text fontSize='sm' fontWeight='bold' color='blue.800'>
                  Producto: {selectedProduct.code} - {selectedProduct.name}
                </Text>
                <Text fontSize='sm' color='blue.600'>
                  Stock actual: {selectedProduct.stock} | Categoría:{' '}
                  {selectedProduct.category?.name}
                </Text>
              </Box>
            )}

            <Flex direction='column' gap='20px'>
              <FormControl isRequired>
                <FormLabel>Cantidad</FormLabel>
                <Input
                  type='number'
                  name='quantity'
                  value={formData.quantity}
                  onChange={handleChange}
                  step='0.01'
                  min='0.01'
                  placeholder='0.00'
                  autoFocus
                  bg={inputBg}
                  color={inputTextColor}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Razón</FormLabel>
                <Input
                  name='reason'
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder={
                    movementType === 'entrada'
                      ? 'Ej: Compra, Producción, Devolución'
                      : 'Ej: Venta, Merma, Ajuste'
                  }
                  bg={inputBg}
                  color={inputTextColor}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notas</FormLabel>
                <Textarea
                  name='notes'
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder='Observaciones adicionales (opcional)'
                  rows={3}
                  bg={inputBg}
                  color={inputTextColor}
                />
              </FormControl>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={closeMovementModal}>
              Cancelar
            </Button>
            <Button
              colorScheme={movementType === 'entrada' ? 'green' : 'red'}
              onClick={handleSubmitMovement}>
              Registrar {movementType === 'entrada' ? 'Entrada' : 'Salida'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para ver historial */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={closeHistoryModal}
        size='6xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Historial de Movimientos
            {selectedProduct && ` - ${selectedProduct.name}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProduct && (
              <Box mb={4} p={3} bg='gray.50' borderRadius='md'>
                <Flex justify='space-between' align='center'>
                  <Box>
                    <Text fontSize='sm' fontWeight='bold'>
                      {selectedProduct.code} - {selectedProduct.name}
                    </Text>
                    <Text fontSize='sm' color='gray.600'>
                      Categoría: {selectedProduct.category?.name}
                    </Text>
                  </Box>
                  <Box textAlign='right'>
                    <Text fontSize='sm' color='gray.600'>
                      Stock Actual
                    </Text>
                    <Text fontSize='2xl' fontWeight='bold' color='blue.500'>
                      {selectedProduct.stock}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {productHistory.length === 0 ? (
              <Box p={4} bg='blue.50' borderRadius='md'>
                <Text color='blue.800'>
                  No hay movimientos registrados para este producto.
                </Text>
              </Box>
            ) : (
              <Box overflowX='auto'>
                <Table variant='simple' size='sm'>
                  <Thead>
                    <Tr>
                      <Th>Fecha</Th>
                      <Th>Tipo</Th>
                      <Th>Cantidad</Th>
                      <Th>Stock Anterior</Th>
                      <Th>Stock Nuevo</Th>
                      <Th>Razón</Th>
                      <Th>Notas</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {productHistory.map((movement) => (
                      <Tr key={movement.id}>
                        <Td>
                          <Text fontSize='xs'>
                            {formatDate(movement.created_at)}
                          </Text>
                        </Td>
                        <Td>{getMovementTypeBadge(movement.movement_type)}</Td>
                        <Td>
                          <Text fontWeight='bold'>{movement.quantity}</Text>
                        </Td>
                        <Td>{movement.previous_stock}</Td>
                        <Td>
                          <Text fontWeight='bold' color='blue.500'>
                            {movement.new_stock}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize='sm'>{movement.reason || '-'}</Text>
                        </Td>
                        <Td>
                          <Text fontSize='sm' noOfLines={2}>
                            {movement.notes || '-'}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={closeHistoryModal}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default StockControl;
