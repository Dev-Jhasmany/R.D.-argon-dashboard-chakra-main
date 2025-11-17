import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { QRCodeSVG } from 'qrcode.react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { FiClock, FiUser, FiLogIn, FiLogOut, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from 'contexts/AuthContext';

function RegisterAttendance() {
  const textColor = useColorModeValue('gray.700', 'white');
  const inputBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();
  const { user } = useAuth();

  const [attendanceData, setAttendanceData] = useState({
    userId: user?.id || '',
    userName: user ? `${user.full_name} ${user.full_last_name}`.trim() : '',
    fecha: new Date().toISOString().split('T')[0],
    horaIngreso: null,
    horaSalida: null,
    estado: 'presente',
    observacion: '',
  });

  const [todayAttendance, setTodayAttendance] = useState(null); // Asistencia del día
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Actualizar la información del usuario cuando esté disponible
    if (user) {
      console.log('👤 Usuario logueado:', user);
      console.log('📝 Datos completos del usuario:', {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        full_last_name: user.full_last_name,
        role: user.role
      });

      setAttendanceData(prev => ({
        ...prev,
        userId: user.id,
        userName: `${user.full_name} ${user.full_last_name}`.trim(),
      }));

      // Cargar asistencia del día si existe
      loadTodayAttendance();
    }
  }, [user]);

  const loadTodayAttendance = async () => {
    try {
      setLoading(true);

      // TODO: Llamar al backend para obtener la asistencia de hoy del usuario
      // const result = await attendanceService.getTodayAttendance(user.id);

      // Simulación: Verificar en localStorage si hay un registro de hoy
      const storedAttendances = localStorage.getItem('attendances');
      if (storedAttendances) {
        const attendances = JSON.parse(storedAttendances);
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = attendances.find(
          att => att.userId === user?.id && att.fecha === today
        );

        if (todayRecord) {
          setTodayAttendance(todayRecord);
          setAttendanceData(prev => ({
            ...prev,
            horaIngreso: todayRecord.horaIngreso,
            horaSalida: todayRecord.horaSalida,
            observacion: todayRecord.observacion || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error al cargar asistencia:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // Formato HH:MM
  };

  const handleCheckIn = async () => {
    const currentTime = getCurrentTime();

    const newAttendance = {
      userId: user?.id,
      userName: attendanceData.userName,
      fecha: attendanceData.fecha,
      horaIngreso: currentTime,
      horaSalida: null,
      estado: 'presente',
      observacion: attendanceData.observacion,
      timestamp: new Date().toISOString(),
    };

    // TODO: Guardar en el backend
    // await attendanceService.registerAttendance(newAttendance);

    // Simulación: Guardar en localStorage
    const storedAttendances = localStorage.getItem('attendances');
    const attendances = storedAttendances ? JSON.parse(storedAttendances) : [];
    attendances.push(newAttendance);
    localStorage.setItem('attendances', JSON.stringify(attendances));

    setTodayAttendance(newAttendance);
    setAttendanceData(prev => ({
      ...prev,
      horaIngreso: currentTime,
    }));

    toast({
      title: 'Ingreso registrado exitosamente',
      description: `Hora de ingreso: ${currentTime}. Debes volver a ingresar al sistema para marcar tu salida.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleCheckOut = async () => {
    if (!todayAttendance || !todayAttendance.horaIngreso) {
      toast({
        title: 'Error',
        description: 'No hay un registro de ingreso para hoy',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (todayAttendance.horaSalida) {
      toast({
        title: 'Ya registraste tu salida',
        description: 'Ya has marcado la salida para hoy',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    const currentTime = getCurrentTime();

    // Actualizar el registro existente
    const updatedAttendance = {
      ...todayAttendance,
      horaSalida: currentTime,
      observacion: attendanceData.observacion,
    };

    // TODO: Actualizar en el backend
    // await attendanceService.updateAttendance(todayAttendance.id, { horaSalida: currentTime });

    // Simulación: Actualizar en localStorage
    const storedAttendances = localStorage.getItem('attendances');
    if (storedAttendances) {
      const attendances = JSON.parse(storedAttendances);
      const today = new Date().toISOString().split('T')[0];
      const index = attendances.findIndex(
        att => att.userId === user?.id && att.fecha === today
      );

      if (index !== -1) {
        attendances[index] = updatedAttendance;
        localStorage.setItem('attendances', JSON.stringify(attendances));
      }
    }

    setTodayAttendance(updatedAttendance);
    setAttendanceData(prev => ({
      ...prev,
      horaSalida: currentTime,
    }));

    toast({
      title: 'Salida registrada exitosamente',
      description: `Hora de salida: ${currentTime}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleObservationChange = (e) => {
    setAttendanceData(prev => ({
      ...prev,
      observacion: e.target.value,
    }));
  };

  const handleGenerateQR = () => {
    const qrInfo = {
      type: 'attendance',
      timestamp: new Date().toISOString(),
      userId: user?.id,
    };
    setQrData(JSON.stringify(qrInfo));
    setIsQRModalOpen(true);
  };

  // Determinar qué mostrar según el estado
  const hasCheckedInToday = todayAttendance && todayAttendance.horaIngreso;
  const hasCheckedOutToday = todayAttendance && todayAttendance.horaSalida;

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Card>
        <CardHeader p='12px 5px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Asistencia
          </Text>
        </CardHeader>
        <CardBody>
          <Tabs colorScheme='blue'>
            <TabList>
              <Tab>
                <Icon as={FiUser} mr={2} />
                Registro Manual
              </Tab>
              <Tab>
                <Icon as={FiClock} mr={2} />
                Registro por QR
              </Tab>
            </TabList>

            <TabPanels>
              {/* Panel de Registro Manual */}
              <TabPanel>
                <VStack spacing={4} align='stretch'>
                  {/* Información del Usuario */}
                  <Box
                    p={4}
                    bg='blue.50'
                    borderRadius='md'
                    borderWidth='1px'
                    borderColor='blue.200'
                  >
                    <HStack spacing={3}>
                      <Icon as={FiUser} color='blue.600' boxSize={5} />
                      <VStack align='start' spacing={0}>
                        <Text fontSize='xs' color='blue.600' fontWeight='bold'>
                          Personal
                        </Text>
                        <Text fontSize='md' color='blue.800' fontWeight='bold'>
                          {attendanceData.userName || 'Usuario no identificado'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Fecha - Solo lectura */}
                  <FormControl>
                    <FormLabel fontSize='sm'>Fecha</FormLabel>
                    <Input
                      type='date'
                      value={attendanceData.fecha}
                      bg={inputBg}
                      isReadOnly
                      cursor='not-allowed'
                      opacity={0.7}
                    />
                    <Text fontSize='xs' color='gray.500' mt={1}>
                      La fecha se asigna automáticamente por el sistema
                    </Text>
                  </FormControl>

                  <Divider />

                  {/* Estado de Asistencia del Día */}
                  {hasCheckedInToday && !hasCheckedOutToday && (
                    <Alert status='info' borderRadius='md'>
                      <AlertIcon />
                      <AlertDescription fontSize='sm'>
                        Ya has marcado tu ingreso hoy a las {todayAttendance.horaIngreso}.
                        Para marcar tu salida, debes volver a ingresar al sistema más tarde.
                      </AlertDescription>
                    </Alert>
                  )}

                  {hasCheckedInToday && hasCheckedOutToday && (
                    <Alert status='success' borderRadius='md'>
                      <AlertIcon />
                      <AlertDescription fontSize='sm'>
                        Asistencia completa del día. Ingreso: {todayAttendance.horaIngreso} |
                        Salida: {todayAttendance.horaSalida}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Sección de Registro de Horarios */}
                  <VStack spacing={3}>
                    <Text fontSize='sm' fontWeight='bold' color={textColor} alignSelf='start'>
                      Registro de Horarios
                    </Text>

                    {/* Botón de Marcar Ingreso */}
                    {!hasCheckedInToday && (
                      <Box width='full'>
                        <Button
                          leftIcon={<FiLogIn />}
                          colorScheme='green'
                          size='lg'
                          width='full'
                          onClick={handleCheckIn}
                        >
                          Marcar Ingreso
                        </Button>
                        <Text fontSize='xs' color='gray.500' mt={2} textAlign='center'>
                          Al marcar ingreso, deberás salir y volver a ingresar para marcar la salida
                        </Text>
                      </Box>
                    )}

                    {/* Mostrar ingreso registrado */}
                    {hasCheckedInToday && (
                      <Box width='full'>
                        <Box p={3} bg='green.50' borderRadius='md' borderWidth='1px' borderColor='green.200'>
                          <HStack justify='space-between'>
                            <HStack>
                              <Icon as={FiCheckCircle} color='green.600' boxSize={5} />
                              <VStack align='start' spacing={0}>
                                <Text fontSize='xs' color='green.600' fontWeight='bold'>
                                  Hora de Ingreso
                                </Text>
                                <Text fontSize='lg' color='green.700' fontWeight='bold'>
                                  {todayAttendance.horaIngreso}
                                </Text>
                              </VStack>
                            </HStack>
                            <Badge colorScheme='green' fontSize='sm' p={2}>
                              Registrado
                            </Badge>
                          </HStack>
                        </Box>
                      </Box>
                    )}

                    {/* Botón de Marcar Salida - Solo si ya marcó ingreso y aún no marca salida */}
                    {hasCheckedInToday && !hasCheckedOutToday && (
                      <Box width='full'>
                        <Button
                          leftIcon={<FiLogOut />}
                          colorScheme='orange'
                          size='lg'
                          width='full'
                          onClick={handleCheckOut}
                        >
                          Marcar Salida
                        </Button>
                      </Box>
                    )}

                    {/* Mostrar salida registrada */}
                    {hasCheckedOutToday && (
                      <Box width='full'>
                        <Box p={3} bg='orange.50' borderRadius='md' borderWidth='1px' borderColor='orange.200'>
                          <HStack justify='space-between'>
                            <HStack>
                              <Icon as={FiCheckCircle} color='orange.600' boxSize={5} />
                              <VStack align='start' spacing={0}>
                                <Text fontSize='xs' color='orange.600' fontWeight='bold'>
                                  Hora de Salida
                                </Text>
                                <Text fontSize='lg' color='orange.700' fontWeight='bold'>
                                  {todayAttendance.horaSalida}
                                </Text>
                              </VStack>
                            </HStack>
                            <Badge colorScheme='orange' fontSize='sm' p={2}>
                              Registrado
                            </Badge>
                          </HStack>
                        </Box>
                      </Box>
                    )}
                  </VStack>

                  <Divider />

                  {/* Estado */}
                  <FormControl>
                    <FormLabel fontSize='sm'>Estado</FormLabel>
                    <Input
                      value='Presente'
                      bg={inputBg}
                      isReadOnly
                      cursor='not-allowed'
                      opacity={0.7}
                    />
                    <Text fontSize='xs' color='gray.500' mt={1}>
                      El estado se asigna automáticamente al marcar ingreso
                    </Text>
                  </FormControl>

                  {/* Observación */}
                  <FormControl>
                    <FormLabel fontSize='sm'>Observación (Opcional)</FormLabel>
                    <Textarea
                      value={attendanceData.observacion}
                      onChange={handleObservationChange}
                      bg={inputBg}
                      placeholder='Ingrese observaciones adicionales (opcional)'
                      rows={3}
                      isDisabled={hasCheckedInToday && hasCheckedOutToday}
                    />
                  </FormControl>
                </VStack>
              </TabPanel>

              {/* Panel de Registro por QR */}
              <TabPanel>
                <VStack spacing={6} align='stretch' py={8}>
                  <Box textAlign='center'>
                    <Icon as={FiClock} boxSize={16} color='blue.500' mb={4} />
                    <Text fontSize='lg' color={textColor} fontWeight='bold' mb={2}>
                      Registro de Asistencia por Código QR
                    </Text>
                    <Text fontSize='sm' color='gray.500' mb={6}>
                      Genere un código QR para que el personal pueda registrar su asistencia
                      escaneándolo con su dispositivo móvil
                    </Text>
                  </Box>

                  <Button
                    colorScheme='purple'
                    size='lg'
                    onClick={handleGenerateQR}
                  >
                    Generar Código QR
                  </Button>

                  <Box
                    p={4}
                    bg='blue.50'
                    borderRadius='md'
                    borderWidth='1px'
                    borderColor='blue.200'
                  >
                    <Text fontSize='sm' color='blue.800'>
                      <strong>Instrucciones:</strong>
                      <br />
                      1. Haga clic en "Generar Código QR"
                      <br />
                      2. El personal debe escanear el código QR con su teléfono
                      <br />
                      3. La asistencia se registrará automáticamente validando la ubicación IP
                    </Text>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Modal de código QR */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Código QR para Registro de Asistencia</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box
                p={6}
                bg='white'
                borderRadius='md'
                boxShadow='lg'
                border='2px solid'
                borderColor='gray.200'
              >
                {qrData && (
                  <QRCodeSVG
                    value={qrData}
                    size={250}
                    level='H'
                    includeMargin={true}
                  />
                )}
              </Box>
              <Text fontSize='sm' color='gray.600' textAlign='center'>
                El personal debe escanear este código QR para registrar su asistencia
              </Text>
              <Text fontSize='xs' color='gray.500' textAlign='center'>
                Este código es válido por 5 minutos
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' onClick={() => setIsQRModalOpen(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default RegisterAttendance;
