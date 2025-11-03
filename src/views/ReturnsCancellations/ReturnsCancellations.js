import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  FormControl,
  FormLabel,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertDescription,
  Textarea,
  Tooltip,
} from '@chakra-ui/react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import salesService from 'services/salesService';
import { useAuth } from 'contexts/AuthContext';

function ReturnsCancellations() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();
  const { user } = useAuth();

  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, filterStatus]);

  const loadSales = async () => {
    setLoading(true);
    const result = await salesService.getAllSales();
    if (result.success) {
      setSales(result.data);
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
    setLoading(false);
  };

  const filterSales = () => {
    let filtered = sales;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterStatus === 'active') {
      filtered = filtered.filter((sale) => sale.is_active && sale.sale_status === 'active');
    } else if (filterStatus === 'returned') {
      filtered = filtered.filter((sale) => sale.is_active && sale.sale_status === 'returned');
    } else if (filterStatus === 'cancelled') {
      filtered = filtered.filter((sale) => !sale.is_active && sale.sale_status === 'cancelled');
    }

    setFilteredSales(filtered);
  };

  // Verificar si el usuario actual puede hacer devoluciones de esta venta
  const canReturn = (sale) => {
    if (!user) return false;

    // CUALQUIER usuario autenticado puede hacer devoluciones
    // La devolución solo cambia el estado de "active" a "returned" pero NO desactiva la venta
    return true;
  };

  // Verificar si el usuario actual puede anular ventas
  const canCancel = () => {
    if (!user || !user.role) return false;

    // Solo los administradores pueden anular ventas
    const adminRoles = ['Administrador', 'Super Administrador'];
    return adminRoles.includes(user.role.name);
  };

  const openReturnModal = (sale) => {
    setSelectedSale(sale);
    setReturnReason('');
    setIsReturnModalOpen(true);
  };

  const openCancelModal = (sale) => {
    setSelectedSale(sale);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleReturn = async () => {
    if (!returnReason.trim()) {
      toast({
        title: 'Motivo requerido',
        description: 'Debe ingresar el motivo de la devolución',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const result = await salesService.returnSale(selectedSale.id, returnReason);

    if (result.success) {
      toast({
        title: 'Venta devuelta',
        description: 'La venta ha sido devuelta exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      setIsReturnModalOpen(false);
      loadSales();
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

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Motivo requerido',
        description: 'Debe ingresar el motivo de la anulación',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const result = await salesService.cancelSale(selectedSale.id, cancelReason);

    if (result.success) {
      toast({
        title: 'Venta anulada',
        description: 'La venta ha sido anulada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      setIsCancelModalOpen(false);
      loadSales();
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

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Card>
        <CardHeader p='12px 5px' mb='12px'>
          <Flex justify='space-between' align='center'>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Devoluciones y Anulaciones
            </Text>
          </Flex>
        </CardHeader>

        <CardBody>
          {/* Filtros */}
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
            gap='20px'
            mb='20px'
          >
            <FormControl>
              <FormLabel fontSize='sm'>Buscar por N° Venta o Cliente</FormLabel>
              <Input
                placeholder='Buscar...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={inputBg}
                size='sm'
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Estado</FormLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                bg={inputBg}
                size='sm'
              >
                <option value='all'>Todas</option>
                <option value='active'>Activas</option>
                <option value='returned'>Devueltas</option>
                <option value='cancelled'>Anuladas</option>
              </Select>
            </FormControl>
          </Grid>

          {/* Tabla de Ventas */}
          <Box overflowX='auto'>
            <Table variant='simple' size='sm'>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor}>N° Venta</Th>
                  <Th borderColor={borderColor}>Fecha</Th>
                  <Th borderColor={borderColor}>Cliente</Th>
                  <Th borderColor={borderColor}>Usuario</Th>
                  <Th borderColor={borderColor}>N° Caja</Th>
                  <Th borderColor={borderColor}>Total</Th>
                  <Th borderColor={borderColor}>Método de Pago</Th>
                  <Th borderColor={borderColor}>Estado</Th>
                  <Th borderColor={borderColor}>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={9} textAlign='center'>
                      Cargando...
                    </Td>
                  </Tr>
                ) : filteredSales.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign='center'>
                      No hay ventas registradas
                    </Td>
                  </Tr>
                ) : (
                  filteredSales.map((sale) => (
                    <Tr key={sale.id}>
                      <Td borderColor={borderColor} fontWeight='bold'>
                        {sale.sale_number}
                      </Td>
                      <Td borderColor={borderColor} fontSize='xs'>
                        {new Date(sale.created_at).toLocaleString('es-BO')}
                      </Td>
                      <Td borderColor={borderColor}>
                        {sale.customer_name || 'Sin nombre'}
                      </Td>
                      <Td borderColor={borderColor}>
                        {sale.created_by?.full_name && sale.created_by?.full_last_name
                          ? `${sale.created_by.full_name} ${sale.created_by.full_last_name}`
                          : sale.cash_register?.opened_by?.full_name && sale.cash_register?.opened_by?.full_last_name
                          ? `${sale.cash_register.opened_by.full_name} ${sale.cash_register.opened_by.full_last_name}`
                          : 'N/A'}
                      </Td>
                      <Td borderColor={borderColor}>
                        {sale.cash_register?.name || 'N/A'}
                      </Td>
                      <Td borderColor={borderColor} fontWeight='semibold'>
                        Bs. {parseFloat(sale.total).toFixed(2)}
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
                        <Badge
                          colorScheme={
                            !sale.is_active
                              ? 'red'
                              : sale.sale_status === 'returned'
                              ? 'orange'
                              : 'green'
                          }
                        >
                          {!sale.is_active
                            ? 'Anulada'
                            : sale.sale_status === 'returned'
                            ? 'Devuelta'
                            : 'Activa'}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Flex gap={2}>
                          <Tooltip
                            label={
                              !sale.is_active
                                ? 'Esta venta ya fue anulada'
                                : sale.sale_status === 'returned'
                                ? 'Esta venta ya fue devuelta'
                                : !canReturn(sale)
                                ? sale.created_by || sale.cash_register
                                  ? 'Solo el vendedor que realizó esta venta puede hacer devoluciones'
                                  : 'Solo administradores pueden procesar devoluciones de ventas online'
                                : 'Procesar devolución de productos'
                            }
                            placement='top'
                          >
                            <Button
                              size='xs'
                              colorScheme='blue'
                              onClick={() => openReturnModal(sale)}
                              isDisabled={!sale.is_active || sale.sale_status === 'returned' || !canReturn(sale)}
                            >
                              Devolución
                            </Button>
                          </Tooltip>
                          <Tooltip
                            label={
                              !sale.is_active
                                ? 'Esta venta ya fue anulada'
                                : !canCancel()
                                ? 'Solo los administradores pueden anular ventas'
                                : sale.sale_status === 'returned'
                                ? 'Anular venta devuelta'
                                : 'Anular venta completa'
                            }
                            placement='top'
                          >
                            <Button
                              size='xs'
                              colorScheme='red'
                              onClick={() => openCancelModal(sale)}
                              isDisabled={!sale.is_active || !canCancel()}
                            >
                              Anular
                            </Button>
                          </Tooltip>
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Modal: Devolución */}
      <Modal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Devolución de Productos</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSale && (
              <>
                <Alert status='info' mb={4}>
                  <AlertIcon />
                  <AlertDescription>
                    Venta: {selectedSale.sale_number} - Bs.{' '}
                    {parseFloat(selectedSale.total).toFixed(2)}
                  </AlertDescription>
                </Alert>
                <FormControl mb={4} isRequired>
                  <FormLabel>Motivo de la Devolución</FormLabel>
                  <Textarea
                    placeholder='Describa el motivo de la devolución...'
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    bg={inputBg}
                  />
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant='ghost'
              mr={3}
              onClick={() => setIsReturnModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button colorScheme='blue' onClick={handleReturn}>
              Procesar Devolución
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: Anulación */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Anular Venta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSale && (
              <>
                <Alert status='warning' mb={4}>
                  <AlertIcon />
                  <AlertDescription>
                    ¿Está seguro que desea anular la venta{' '}
                    {selectedSale.sale_number}?
                  </AlertDescription>
                </Alert>
                <FormControl mb={4} isRequired>
                  <FormLabel>Motivo de la Anulación</FormLabel>
                  <Textarea
                    placeholder='Describa el motivo de la anulación...'
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    bg={inputBg}
                  />
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant='ghost'
              mr={3}
              onClick={() => setIsCancelModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button colorScheme='red' onClick={handleCancel}>
              Anular Venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default ReturnsCancellations;
