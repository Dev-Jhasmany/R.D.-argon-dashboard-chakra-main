import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  Select,
  HStack,
  VStack,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  SimpleGrid,
  Checkbox,
} from '@chakra-ui/react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { FiEdit, FiTrash2, FiClock, FiPlus } from 'react-icons/fi';
import roleService from 'services/roleService';

function ScheduleManagement() {
  const textColor = useColorModeValue('gray.700', 'white');
  const inputBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const toast = useToast();

  const [schedules, setSchedules] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    scheduleName: '',
    scheduleType: 'oficina', // oficina o continuo

    // Para horario de oficina (con almuerzo)
    morningStart: '',
    morningEnd: '',
    afternoonStart: '',
    afternoonEnd: '',

    // Para horario continuo
    continuousStart: '',
    continuousEnd: '',

    // Configuración de horas extras
    overtimeStart: '',
    overtimeEnd: '',

    // Estado del horario
    status: 'normal', // normal o horas_extras

    // Días aplicables
    daysOfWeek: [],
  });

  const weekDays = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' },
  ];

  useEffect(() => {
    loadSchedules();
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const result = await roleService.getAllRoles();
      if (result.success) {
        setRoles(result.data);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los roles',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const loadSchedules = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada al API
      // const response = await scheduleService.getSchedules();
      // setSchedules(response.data);

      // Datos de ejemplo
      setSchedules([
        {
          id: 1,
          scheduleName: 'Horario Regular Semana',
          scheduleType: 'oficina',
          morningStart: '08:00',
          morningEnd: '12:00',
          afternoonStart: '14:00',
          afternoonEnd: '18:00',
          status: 'normal',
          daysOfWeek: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
        },
        {
          id: 2,
          scheduleName: 'Horario Continuo Fin de Semana',
          scheduleType: 'continuo',
          continuousStart: '09:00',
          continuousEnd: '17:00',
          status: 'normal',
          daysOfWeek: ['sabado', 'domingo'],
        },
        {
          id: 3,
          scheduleName: 'Horario con Horas Extra',
          scheduleType: 'oficina',
          morningStart: '08:00',
          morningEnd: '12:00',
          afternoonStart: '14:00',
          afternoonEnd: '18:00',
          overtimeStart: '18:00',
          overtimeEnd: '20:00',
          status: 'horas_extras',
          daysOfWeek: ['lunes', 'miercoles', 'viernes'],
        },
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los horarios',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleScheduleTypeChange = (value) => {
    setFormData({
      ...formData,
      scheduleType: value,
      // Limpiar campos que no aplican
      morningStart: '',
      morningEnd: '',
      afternoonStart: '',
      afternoonEnd: '',
      continuousStart: '',
      continuousEnd: '',
    });
  };

  const handleDayToggle = (day) => {
    const currentDays = formData.daysOfWeek;
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];

    setFormData({
      ...formData,
      daysOfWeek: updatedDays,
    });
  };

  const validateForm = () => {
    if (!formData.scheduleName.trim()) {
      toast({
        title: 'Error',
        description: 'Debe ingresar un nombre para el horario',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (formData.scheduleType === 'oficina') {
      if (!formData.morningStart || !formData.morningEnd || !formData.afternoonStart || !formData.afternoonEnd) {
        toast({
          title: 'Error',
          description: 'Debe completar todos los horarios de mañana y tarde',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
    } else {
      if (!formData.continuousStart || !formData.continuousEnd) {
        toast({
          title: 'Error',
          description: 'Debe completar el horario continuo',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
    }

    if (formData.status === 'horas_extras' && (!formData.overtimeStart || !formData.overtimeEnd)) {
      toast({
        title: 'Error',
        description: 'Debe completar el horario de horas extras',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        // TODO: Implementar actualización
        // await scheduleService.updateSchedule(editingId, formData);

        setSchedules(schedules.map(s =>
          s.id === editingId ? { ...formData, id: editingId } : s
        ));

        toast({
          title: 'Éxito',
          description: 'Horario actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEditingId(null);
      } else {
        // TODO: Implementar creación
        // await scheduleService.createSchedule(formData);

        const newSchedule = {
          ...formData,
          id: schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1,
        };
        setSchedules([...schedules, newSchedule]);

        toast({
          title: 'Éxito',
          description: 'Horario registrado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Resetear formulario
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el horario',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      scheduleName: '',
      scheduleType: 'oficina',
      morningStart: '',
      morningEnd: '',
      afternoonStart: '',
      afternoonEnd: '',
      continuousStart: '',
      continuousEnd: '',
      overtimeStart: '',
      overtimeEnd: '',
      status: 'normal',
      daysOfWeek: [],
    });
    setEditingId(null);
  };

  const handleEdit = (schedule) => {
    setFormData(schedule);
    setEditingId(schedule.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este horario?')) {
      return;
    }

    try {
      // TODO: Implementar llamada al API
      // await scheduleService.deleteSchedule(id);

      setSchedules(schedules.filter(s => s.id !== id));

      toast({
        title: 'Éxito',
        description: 'Horario eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el horario',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusBadge = (status) => {
    return status === 'normal' ? (
      <Badge colorScheme="green">Horario Normal</Badge>
    ) : (
      <Badge colorScheme="orange">Con Horas Extras</Badge>
    );
  };

  const getScheduleTypeBadge = (type) => {
    return type === 'oficina' ? (
      <Badge colorScheme="blue">Horario de Oficina</Badge>
    ) : (
      <Badge colorScheme="purple">Horario Continuo</Badge>
    );
  };

  const formatTimeDisplay = (schedule) => {
    if (schedule.scheduleType === 'oficina') {
      return `${schedule.morningStart}-${schedule.morningEnd} / ${schedule.afternoonStart}-${schedule.afternoonEnd}`;
    } else {
      return `${schedule.continuousStart}-${schedule.continuousEnd}`;
    }
  };

  const formatDaysDisplay = (days) => {
    return days.map(day => {
      const dayObj = weekDays.find(d => d.value === day);
      return dayObj ? dayObj.label : day;
    }).join(', ');
  };

  return (
    <Flex direction="column" pt={{ base: '120px', md: '75px' }}>
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }} mb={4}>
        <CardHeader p="6px 0px 22px 0px">
          <Flex justify="space-between" align="center">
            <Text fontSize="xl" color={textColor} fontWeight="bold">
              {editingId ? 'Editar Horario del Establecimiento' : 'Crear Horario del Establecimiento'}
            </Text>
            {editingId && (
              <Button size="sm" variant="ghost" onClick={resetForm}>
                Cancelar Edición
              </Button>
            )}
          </Flex>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Nombre del horario */}
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Nombre del Horario</FormLabel>
                <Select
                  name="scheduleName"
                  value={formData.scheduleName}
                  onChange={handleInputChange}
                  placeholder="Seleccione un rol"
                  bg={inputBg}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              {/* Tipo de horario */}
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Tipo de Horario</FormLabel>
                <RadioGroup
                  value={formData.scheduleType}
                  onChange={handleScheduleTypeChange}
                >
                  <Stack direction="row" spacing={6}>
                    <Radio value="oficina" colorScheme="blue">
                      Horario de Oficina (con almuerzo)
                    </Radio>
                    <Radio value="continuo" colorScheme="purple">
                      Horario Continuo
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Horario de Oficina */}
              {formData.scheduleType === 'oficina' && (
                <Box bg={bgColor} p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={3}>Configuración Horario de Oficina</Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Inicio Mañana</FormLabel>
                      <Input
                        name="morningStart"
                        type="time"
                        value={formData.morningStart}
                        onChange={handleInputChange}
                        bg={inputBg}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Fin Mañana</FormLabel>
                      <Input
                        name="morningEnd"
                        type="time"
                        value={formData.morningEnd}
                        onChange={handleInputChange}
                        bg={inputBg}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Inicio Tarde</FormLabel>
                      <Input
                        name="afternoonStart"
                        type="time"
                        value={formData.afternoonStart}
                        onChange={handleInputChange}
                        bg={inputBg}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Fin Tarde</FormLabel>
                      <Input
                        name="afternoonEnd"
                        type="time"
                        value={formData.afternoonEnd}
                        onChange={handleInputChange}
                        bg={inputBg}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}

              {/* Horario Continuo */}
              {formData.scheduleType === 'continuo' && (
                <Box bg={bgColor} p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={3}>Configuración Horario Continuo</Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Hora de Inicio</FormLabel>
                      <Input
                        name="continuousStart"
                        type="time"
                        value={formData.continuousStart}
                        onChange={handleInputChange}
                        bg={inputBg}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Hora de Fin</FormLabel>
                      <Input
                        name="continuousEnd"
                        type="time"
                        value={formData.continuousEnd}
                        onChange={handleInputChange}
                        bg={inputBg}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}

              <Divider />

              {/* Estado del horario */}
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Estado del Horario</FormLabel>
                <RadioGroup
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <Stack direction="row" spacing={6}>
                    <Radio value="normal" colorScheme="green">
                      Horario Normal
                    </Radio>
                    <Radio value="horas_extras" colorScheme="orange">
                      Con Horas Extras
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Configuración de horas extras */}
              {formData.status === 'horas_extras' && (
                <Box bg={bgColor} p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={3}>Configuración de Horas Extras</Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Inicio Horas Extras</FormLabel>
                      <Input
                        name="overtimeStart"
                        type="time"
                        value={formData.overtimeStart}
                        onChange={handleInputChange}
                        bg={inputBg}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Fin Horas Extras</FormLabel>
                      <Input
                        name="overtimeEnd"
                        type="time"
                        value={formData.overtimeEnd}
                        onChange={handleInputChange}
                        bg={inputBg}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}

              <Divider />

              {/* Días de la semana */}
              <FormControl>
                <FormLabel fontWeight="bold">Días Aplicables</FormLabel>
                <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={3}>
                  {weekDays.map((day) => (
                    <Checkbox
                      key={day.value}
                      isChecked={formData.daysOfWeek.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      colorScheme="blue"
                    >
                      {day.label}
                    </Checkbox>
                  ))}
                </SimpleGrid>
              </FormControl>

              <Divider />

              {/* Botones de acción */}
              <Flex justify="flex-end" gap={3}>
                {editingId && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  leftIcon={editingId ? <FiEdit /> : <FiPlus />}
                >
                  {editingId ? 'Actualizar Horario' : 'Crear Horario'}
                </Button>
              </Flex>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Tabla de horarios */}
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <CardHeader p="6px 0px 22px 0px">
          <Text fontSize="xl" color={textColor} fontWeight="bold">
            Horarios del Establecimiento Registrados
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant="simple" color={textColor}>
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>Nombre</Th>
                <Th borderColor={borderColor}>Tipo</Th>
                <Th borderColor={borderColor}>Horario</Th>
                <Th borderColor={borderColor}>Horas Extras</Th>
                <Th borderColor={borderColor}>Estado</Th>
                <Th borderColor={borderColor}>Días</Th>
                <Th borderColor={borderColor}>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {schedules.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <VStack spacing={2}>
                      <FiClock size={40} opacity={0.3} />
                      <Text>No hay horarios registrados</Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                schedules.map((schedule) => (
                  <Tr key={schedule.id}>
                    <Td borderColor={borderColor} fontWeight="bold">
                      {schedule.scheduleName}
                    </Td>
                    <Td borderColor={borderColor}>
                      {getScheduleTypeBadge(schedule.scheduleType)}
                    </Td>
                    <Td borderColor={borderColor}>
                      {formatTimeDisplay(schedule)}
                    </Td>
                    <Td borderColor={borderColor}>
                      {schedule.overtimeStart && schedule.overtimeEnd
                        ? `${schedule.overtimeStart}-${schedule.overtimeEnd}`
                        : '-'}
                    </Td>
                    <Td borderColor={borderColor}>
                      {getStatusBadge(schedule.status)}
                    </Td>
                    <Td borderColor={borderColor} fontSize="sm">
                      {formatDaysDisplay(schedule.daysOfWeek)}
                    </Td>
                    <Td borderColor={borderColor}>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Editar"
                          icon={<FiEdit />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEdit(schedule)}
                        />
                        <IconButton
                          aria-label="Eliminar"
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(schedule.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default ScheduleManagement;
