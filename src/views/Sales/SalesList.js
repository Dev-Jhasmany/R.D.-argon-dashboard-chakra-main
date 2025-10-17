import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Table,
  Tbody,
  Td,
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
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  IconButton,
  Tooltip,
  Input,
} from '@chakra-ui/react';
import { ViewIcon, DeleteIcon } from '@chakra-ui/icons';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import salesService from 'services/salesService';

function SalesList() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'white');
  const toast = useToast();

  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const result = await salesService.getAllSales();
    if (result.success) {
      setSales(result.data);
      setFilteredSales(result.data);
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredSales(sales);
      return;
    }

    const filtered = sales.filter(
      (sale) =>
        sale.sale_number.toLowerCase().includes(value.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(value.toLowerCase()) ||
        sale.customer_nit?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSales(filtered);
  };

  const openDetailModal = (sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSale(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta venta?')) {
      return;
    }

    const result = await salesService.deleteSale(id);
    if (result.success) {
      toast({
        title: 'Venta eliminada',
        description: 'La venta ha sido eliminada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadSales();
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

  const getPaymentMethodBadge = (method) => {
    const colors = {
      efectivo: 'green',
      tarjeta: 'blue',
      transferencia: 'purple',
      qr: 'orange',
    };
    return (
      <Badge colorScheme={colors[method] || 'gray'}>
        {method.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <CardHeader p='12px 5px'>
          <Flex justify='space-between' align='center' wrap='wrap' gap={4}>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Listado de Ventas
            </Text>
            <Box minW={{ base: '100%', md: '300px' }}>
              <Input
                placeholder='Buscar por número, cliente o NIT...'
                value={searchTerm}
                onChange={handleSearchChange}
                size='md'
                bg={inputBg}
                color={inputTextColor}
              />
            </Box>
          </Flex>
        </CardHeader>
        <CardBody>
          {sales.length === 0 ? (
            <Box p={4} bg='blue.50' borderRadius='md'>
              <Text color='blue.800'>
                No hay ventas registradas aún.
              </Text>
            </Box>
          ) : filteredSales.length === 0 ? (
            <Box p={4} bg='blue.50' borderRadius='md'>
              <Text color='blue.800'>
                No se encontraron ventas con el término "{searchTerm}"
              </Text>
            </Box>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>
                    Nº Venta
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Fecha
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Cliente
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    NIT/CI
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Total
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Método Pago
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Acciones
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSales.map((sale) => (
                  <Tr key={sale.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>
                        {sale.sale_number}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{formatDate(sale.created_at)}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{sale.customer_name || 'Sin nombre'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{sale.customer_nit || '-'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold' color='green.500'>
                        Bs. {parseFloat(sale.total).toFixed(2)}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      {getPaymentMethodBadge(sale.payment_method)}
                    </Td>
                    <Td borderColor={borderColor}>
                      <Flex gap={2}>
                        <Tooltip label='Ver Detalles'>
                          <IconButton
                            icon={<ViewIcon />}
                            colorScheme='blue'
                            variant='outline'
                            size='sm'
                            onClick={() => openDetailModal(sale)}
                          />
                        </Tooltip>
                        <Tooltip label='Eliminar'>
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme='red'
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(sale.id)}
                          />
                        </Tooltip>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal de detalles */}
      <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} size='4xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Detalles de Venta {selectedSale?.sale_number}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSale && (
              <Flex direction='column' gap='20px'>
                {/* Información general */}
                <Box p={4} bg='gray.50' borderRadius='md'>
                  <Flex direction='column' gap={2}>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' fontWeight='bold'>
                        Fecha:
                      </Text>
                      <Text fontSize='sm'>{formatDate(selectedSale.created_at)}</Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' fontWeight='bold'>
                        Cliente:
                      </Text>
                      <Text fontSize='sm'>
                        {selectedSale.customer_name || 'Sin nombre'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' fontWeight='bold'>
                        NIT/CI:
                      </Text>
                      <Text fontSize='sm'>{selectedSale.customer_nit || '-'}</Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' fontWeight='bold'>
                        Método de Pago:
                      </Text>
                      {getPaymentMethodBadge(selectedSale.payment_method)}
                    </Flex>
                    {selectedSale.notes && (
                      <Flex justify='space-between'>
                        <Text fontSize='sm' fontWeight='bold'>
                          Notas:
                        </Text>
                        <Text fontSize='sm'>{selectedSale.notes}</Text>
                      </Flex>
                    )}
                  </Flex>
                </Box>

                {/* Productos */}
                <Box>
                  <Text fontSize='md' fontWeight='bold' mb={3}>
                    Productos Vendidos
                  </Text>
                  <Table size='sm' variant='simple'>
                    <Thead>
                      <Tr>
                        <Th>Código</Th>
                        <Th>Producto</Th>
                        <Th>Cantidad</Th>
                        <Th>Precio Unit.</Th>
                        <Th>Subtotal</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedSale.details.map((detail) => (
                        <Tr key={detail.id}>
                          <Td>{detail.product?.code}</Td>
                          <Td>{detail.product?.name}</Td>
                          <Td>{detail.quantity}</Td>
                          <Td>Bs. {parseFloat(detail.unit_price).toFixed(2)}</Td>
                          <Td>Bs. {parseFloat(detail.subtotal).toFixed(2)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                {/* Totales */}
                <Box p={4} bg='blue.50' borderRadius='md'>
                  <Flex direction='column' gap={2}>
                    <Flex justify='space-between'>
                      <Text fontSize='sm'>Subtotal:</Text>
                      <Text fontSize='sm' fontWeight='bold'>
                        Bs. {parseFloat(selectedSale.subtotal).toFixed(2)}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text fontSize='sm'>Descuento:</Text>
                      <Text fontSize='sm' fontWeight='bold'>
                        Bs. {parseFloat(selectedSale.discount).toFixed(2)}
                      </Text>
                    </Flex>
                    <Box borderTop='1px' borderColor={borderColor} pt={2}>
                      <Flex justify='space-between'>
                        <Text fontSize='lg' fontWeight='bold'>
                          Total:
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color='green.500'>
                          Bs. {parseFloat(selectedSale.total).toFixed(2)}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeDetailModal}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default SalesList;
