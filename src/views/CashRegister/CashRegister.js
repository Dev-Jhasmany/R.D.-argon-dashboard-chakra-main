/**
 * COMPONENTE: CashRegister (Control de Caja)
 *
 * Gestiona apertura, cierre y arqueo de caja.
 *
 * FUNCIONALIDADES:
 * - Abrir caja con monto inicial
 * - Ver resumen de caja actual (arqueo)
 * - Registrar movimientos (ingresos/egresos)
 * - Cerrar caja con conteo final
 * - Historial de cajas
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Grid,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import cashRegisterService from 'services/cashRegisterService';
import { useAuth } from 'contexts/AuthContext';

function CashRegister() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();
  const { user } = useAuth();

  const [cashRegister, setCashRegister] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [nextCashRegisterNumber, setNextCashRegisterNumber] = useState(1);

  const [openForm, setOpenForm] = useState({
    name: '',
    user_name: '',
    opening_amount: '',
    notes: '',
  });

  const [closeForm, setCloseForm] = useState({
    closing_amount: '',
    notes: '',
  });

  const [movementForm, setMovementForm] = useState({
    type: 'deposit',
    amount: '',
    description: '',
  });

  useEffect(() => {
    checkOpenCashRegister();
    loadHistory();
  }, []);

  // Actualizar el formulario cuando cambia el número de caja o el modal se abre
  useEffect(() => {
    if (isOpenModalOpen && user) {
      const fullName = `${user.full_name || ''} ${user.full_last_name || ''}`.trim();
      setOpenForm(prev => ({
        ...prev,
        name: `Caja #${nextCashRegisterNumber}`,
        user_name: fullName || user.username || user.email || 'Usuario',
      }));
    }
  }, [isOpenModalOpen, nextCashRegisterNumber, user]);

  const checkOpenCashRegister = async () => {
    const result = await cashRegisterService.getOpenCashRegister();
    if (result.success) {
      setCashRegister(result.data);
      loadSummary();
    } else {
      setCashRegister(null);
      setSummary(null);
    }
  };

  const loadSummary = async () => {
    const result = await cashRegisterService.getCashRegisterSummary();
    if (result.success) {
      setSummary(result.data);
    }
  };

  const loadHistory = async () => {
    const result = await cashRegisterService.getAllCashRegisters();
    if (result.success) {
      setHistory(result.data.slice(0, 10));
      // Calcular el siguiente número de caja
      const allCashRegisters = result.data;
      if (allCashRegisters.length > 0) {
        // Encontrar el número más alto de caja
        const maxNumber = allCashRegisters.reduce((max, item) => {
          if (item.name && item.name.startsWith('Caja #')) {
            const num = parseInt(item.name.replace('Caja #', ''));
            return num > max ? num : max;
          }
          return max;
        }, 0);
        setNextCashRegisterNumber(maxNumber + 1);
      } else {
        setNextCashRegisterNumber(1);
      }
    }
  };

  const handleOpenCashRegister = async () => {
    if (!openForm.opening_amount || parseFloat(openForm.opening_amount) < 0) {
      toast({
        title: 'Monto inválido',
        description: 'Ingrese un monto inicial válido',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const result = await cashRegisterService.openCashRegister({
      name: openForm.name,
      opening_amount: parseFloat(openForm.opening_amount),
      notes: openForm.notes,
    });

    if (result.success) {
      toast({
        title: 'Caja abierta',
        description: 'La caja se abrió exitosamente',
        status: 'success',
        duration: 3000,
      });
      setIsOpenModalOpen(false);
      setOpenForm({ name: '', user_name: '', opening_amount: '', notes: '' });
      checkOpenCashRegister();
      loadHistory();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleCloseCashRegister = async () => {
    // Calcular el monto final sumando todos los métodos de pago
    const closingAmount =
      parseFloat(cashRegister.total_efectivo || 0) +
      parseFloat(cashRegister.total_qr || 0) +
      parseFloat(cashRegister.total_paypal || 0) +
      parseFloat(cashRegister.total_stripe || 0);

    const result = await cashRegisterService.closeCashRegister({
      closing_amount: closingAmount,
      notes: closeForm.notes,
    });

    if (result.success) {
      const diff = result.data.difference;
      toast({
        title: 'Caja cerrada',
        description: `Diferencia: Bs. ${parseFloat(diff).toFixed(2)}`,
        status: diff === 0 ? 'success' : 'warning',
        duration: 5000,
      });
      setIsCloseModalOpen(false);
      setCloseForm({ closing_amount: '', notes: '' });
      checkOpenCashRegister();
      loadHistory();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleCreateMovement = async () => {
    if (!movementForm.amount || parseFloat(movementForm.amount) <= 0) {
      toast({
        title: 'Monto inválido',
        description: 'Ingrese un monto válido',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const result = await cashRegisterService.createCashMovement({
      type: movementForm.type,
      amount: parseFloat(movementForm.amount),
      description: movementForm.description,
    });

    if (result.success) {
      toast({
        title: 'Movimiento registrado',
        status: 'success',
        duration: 3000,
      });
      setIsMovementModalOpen(false);
      setMovementForm({ type: 'deposit', amount: '', description: '' });
      loadSummary();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      {/* Botones de acción */}
      <Flex mb='22px' gap='10px'>
        {!cashRegister ? (
          <Button colorScheme='green' onClick={() => setIsOpenModalOpen(true)}>
            Abrir Caja
          </Button>
        ) : (
          <>
            <Button colorScheme='blue' onClick={() => setIsMovementModalOpen(true)}>
              Registrar Movimiento
            </Button>
            <Button colorScheme='red' onClick={() => setIsCloseModalOpen(true)}>
              Cerrar Caja
            </Button>
          </>
        )}
      </Flex>

      {/* Estado de caja y resumen */}
      {cashRegister ? (
        <Grid templateColumns={{ sm: '1fr', lg: '2fr 1fr' }} gap='22px' mb='22px'>
          <Card>
            <CardHeader p='12px 5px'>
              <Text fontSize='xl' color={textColor} fontWeight='bold'>
                Caja Actual
              </Text>
            </CardHeader>
            <CardBody>
              <Grid templateColumns='repeat(2, 1fr)' gap='20px'>
                <Stat>
                  <StatLabel>Apertura</StatLabel>
                  <StatNumber>
                    Bs. {parseFloat(cashRegister.opening_amount).toFixed(2)}
                  </StatNumber>
                  <StatHelpText>
                    {new Date(cashRegister.opened_at).toLocaleString('es-BO')}
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Abierta por</StatLabel>
                  <StatNumber fontSize='lg'>
                    {cashRegister.opened_by
                      ? `${cashRegister.opened_by.full_name || ''} ${cashRegister.opened_by.full_last_name || ''}`.trim()
                      : 'N/A'}
                  </StatNumber>
                </Stat>
              </Grid>
            </CardBody>
          </Card>

          {summary && (
            <Card>
              <CardHeader p='12px 5px'>
                <Text fontSize='xl' color={textColor} fontWeight='bold'>
                  Arqueo de Caja
                </Text>
              </CardHeader>
              <CardBody>
                <Flex direction='column' gap='10px'>
                  <Flex justify='space-between'>
                    <Text fontSize='sm'>Ventas:</Text>
                    <Text fontSize='sm' fontWeight='bold' color='green.500'>
                      + Bs. {summary.sales.toFixed(2)}
                    </Text>
                  </Flex>
                  <Flex justify='space-between'>
                    <Text fontSize='sm'>Depósitos:</Text>
                    <Text fontSize='sm' fontWeight='bold' color='green.500'>
                      + Bs. {summary.deposits.toFixed(2)}
                    </Text>
                  </Flex>
                  <Flex justify='space-between'>
                    <Text fontSize='sm'>Gastos:</Text>
                    <Text fontSize='sm' fontWeight='bold' color='red.500'>
                      - Bs. {summary.expenses.toFixed(2)}
                    </Text>
                  </Flex>
                  <Flex justify='space-between'>
                    <Text fontSize='sm'>Retiros:</Text>
                    <Text fontSize='sm' fontWeight='bold' color='red.500'>
                      - Bs. {summary.withdrawals.toFixed(2)}
                    </Text>
                  </Flex>
                  <Box borderTop='1px' borderColor={borderColor} pt={3}>
                    <Flex justify='space-between'>
                      <Text fontSize='lg' fontWeight='bold'>
                        Total Esperado:
                      </Text>
                      <Text fontSize='xl' fontWeight='bold' color='blue.500'>
                        Bs. {summary.expected_amount.toFixed(2)}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          )}
        </Grid>
      ) : (
        <Alert status='info' mb='22px'>
          <AlertIcon />
          <AlertDescription>
            No hay ninguna caja abierta. Haga clic en "Abrir Caja" para comenzar.
          </AlertDescription>
        </Alert>
      )}

      {/* Historial */}
      <Card>
        <CardHeader p='12px 5px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Historial de Cajas
          </Text>
        </CardHeader>
        <CardBody>
          <Box overflowX='auto'>
            <Table variant='simple' size='sm'>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor}>Nombre Caja</Th>
                  <Th borderColor={borderColor}>Usuario</Th>
                  <Th borderColor={borderColor}>Apertura</Th>
                  <Th borderColor={borderColor}>Cierre</Th>
                  <Th borderColor={borderColor}>Monto Inicial</Th>
                  <Th borderColor={borderColor}>Monto Final</Th>
                  <Th borderColor={borderColor}>Efectivo</Th>
                  <Th borderColor={borderColor}>QR</Th>
                  <Th borderColor={borderColor}>PayPal</Th>
                  <Th borderColor={borderColor}>Stripe</Th>
                  <Th borderColor={borderColor}>Devolución</Th>
                  <Th borderColor={borderColor}>Diferencia</Th>
                  <Th borderColor={borderColor}>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {history.map((item) => (
                  <Tr key={item.id}>
                    <Td borderColor={borderColor} fontSize='xs'>
                      {item.name || `Caja #${item.id}`}
                    </Td>
                    <Td borderColor={borderColor} fontSize='xs'>
                      {item.opened_by
                        ? `${item.opened_by.full_name || ''} ${item.opened_by.full_last_name || ''}`.trim()
                        : 'N/A'}
                    </Td>
                    <Td borderColor={borderColor} fontSize='xs'>
                      {new Date(item.opened_at).toLocaleString('es-BO')}
                    </Td>
                    <Td borderColor={borderColor} fontSize='xs'>
                      {item.closed_at
                        ? new Date(item.closed_at).toLocaleString('es-BO')
                        : '-'}
                    </Td>
                    <Td borderColor={borderColor}>
                      Bs. {parseFloat(item.opening_amount).toFixed(2)}
                    </Td>
                    <Td borderColor={borderColor}>
                      {item.closing_amount
                        ? `Bs. ${parseFloat(item.closing_amount).toFixed(2)}`
                        : '-'}
                    </Td>
                    <Td borderColor={borderColor}>
                      Bs. {parseFloat(item.total_efectivo || 0).toFixed(2)}
                    </Td>
                    <Td borderColor={borderColor}>
                      Bs. {parseFloat(item.total_qr || 0).toFixed(2)}
                    </Td>
                    <Td borderColor={borderColor}>
                      Bs. {parseFloat(item.total_paypal || 0).toFixed(2)}
                    </Td>
                    <Td borderColor={borderColor}>
                      Bs. {parseFloat(item.total_stripe || 0).toFixed(2)}
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text color='red.500' fontWeight='semibold'>
                        Bs. {parseFloat(item.total_returns || 0).toFixed(2)}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      {item.difference !== null ? (
                        <Text
                          color={
                            item.difference === 0
                              ? 'green.500'
                              : item.difference > 0
                              ? 'blue.500'
                              : 'red.500'
                          }
                          fontWeight='bold'
                        >
                          Bs. {parseFloat(item.difference).toFixed(2)}
                        </Text>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge colorScheme={item.status === 'open' ? 'green' : 'gray'}>
                        {item.status === 'open' ? 'Abierta' : 'Cerrada'}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Modal: Abrir Caja */}
      <Modal isOpen={isOpenModalOpen} onClose={() => setIsOpenModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Abrir Caja</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Nombre de Caja</FormLabel>
              <Input
                value={openForm.name}
                isReadOnly
                bg={useColorModeValue('gray.100', 'gray.600')}
                cursor='not-allowed'
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Usuario</FormLabel>
              <Input
                value={openForm.user_name}
                isReadOnly
                bg={useColorModeValue('gray.100', 'gray.600')}
                cursor='not-allowed'
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Monto Inicial (Bs.)</FormLabel>
              <Input
                type='number'
                step='0.01'
                min='0'
                value={openForm.opening_amount}
                onChange={(e) =>
                  setOpenForm({ ...openForm, opening_amount: e.target.value })
                }
                bg={inputBg}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Notas</FormLabel>
              <Input
                value={openForm.notes}
                onChange={(e) => setOpenForm({ ...openForm, notes: e.target.value })}
                bg={inputBg}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={() => setIsOpenModalOpen(false)}>
              Cancelar
            </Button>
            <Button colorScheme='green' onClick={handleOpenCashRegister}>
              Abrir Caja
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: Cerrar Caja */}
      <Modal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cerrar Caja</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {cashRegister && (
              <>
                <Alert status='info' mb={4}>
                  <AlertIcon />
                  <Box flex='1'>
                    <Text fontWeight='bold' mb={2}>Totales por Método de Pago:</Text>
                    <Flex direction='column' fontSize='sm' gap={1}>
                      <Flex justify='space-between'>
                        <Text>Efectivo:</Text>
                        <Text fontWeight='semibold'>Bs. {parseFloat(cashRegister.total_efectivo || 0).toFixed(2)}</Text>
                      </Flex>
                      <Flex justify='space-between'>
                        <Text>QR:</Text>
                        <Text fontWeight='semibold'>Bs. {parseFloat(cashRegister.total_qr || 0).toFixed(2)}</Text>
                      </Flex>
                      <Flex justify='space-between'>
                        <Text>PayPal:</Text>
                        <Text fontWeight='semibold'>Bs. {parseFloat(cashRegister.total_paypal || 0).toFixed(2)}</Text>
                      </Flex>
                      <Flex justify='space-between'>
                        <Text>Stripe:</Text>
                        <Text fontWeight='semibold'>Bs. {parseFloat(cashRegister.total_stripe || 0).toFixed(2)}</Text>
                      </Flex>
                    </Flex>
                  </Box>
                </Alert>
                <Alert status='success' mb={4}>
                  <AlertIcon />
                  <Box flex='1'>
                    <Text fontWeight='bold'>Monto Final de Cierre:</Text>
                    <Text fontSize='2xl' color='green.600' fontWeight='bold'>
                      Bs. {(
                        parseFloat(cashRegister.total_efectivo || 0) +
                        parseFloat(cashRegister.total_qr || 0) +
                        parseFloat(cashRegister.total_paypal || 0) +
                        parseFloat(cashRegister.total_stripe || 0)
                      ).toFixed(2)}
                    </Text>
                  </Box>
                </Alert>
              </>
            )}
            <FormControl>
              <FormLabel>Notas de Cierre</FormLabel>
              <Input
                value={closeForm.notes}
                onChange={(e) => setCloseForm({ ...closeForm, notes: e.target.value })}
                bg={inputBg}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={() => setIsCloseModalOpen(false)}>
              Cancelar
            </Button>
            <Button colorScheme='red' onClick={handleCloseCashRegister}>
              Cerrar Caja
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: Registrar Movimiento */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Registrar Movimiento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Tipo de Movimiento</FormLabel>
              <Select
                value={movementForm.type}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, type: e.target.value })
                }
                bg={inputBg}
              >
                <option value='deposit'>Depósito / Ingreso</option>
                <option value='withdrawal'>Retiro</option>
                <option value='expense'>Gasto / Egreso</option>
              </Select>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Monto (Bs.)</FormLabel>
              <Input
                type='number'
                step='0.01'
                min='0.01'
                value={movementForm.amount}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, amount: e.target.value })
                }
                bg={inputBg}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Input
                value={movementForm.description}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, description: e.target.value })
                }
                bg={inputBg}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='ghost'
              mr={3}
              onClick={() => setIsMovementModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button colorScheme='blue' onClick={handleCreateMovement}>
              Registrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default CashRegister;
