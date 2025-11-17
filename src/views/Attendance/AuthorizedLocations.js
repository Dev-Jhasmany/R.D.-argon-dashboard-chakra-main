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
  VStack,
  Badge,
  Switch,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';

function AuthorizedLocations() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();

  const [locations, setLocations] = useState([
    {
      id: 1,
      nombre: 'Caja Principal',
      ip: '192.168.1.100',
      descripcion: 'Punto de venta - Área de caja',
      activo: true,
    },
    {
      id: 2,
      nombre: 'Cocina',
      ip: '192.168.1.101',
      descripcion: 'Área de cocina - Registro de cocineros',
      activo: true,
    },
    {
      id: 3,
      nombre: 'Área de Meseros',
      ip: '192.168.1.102',
      descripcion: 'Estación de meseros - Registro de personal de servicio',
      activo: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ip: '',
    descripcion: '',
    activo: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const openAddModal = () => {
    setEditingLocation(null);
    setFormData({
      nombre: '',
      ip: '',
      descripcion: '',
      activo: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (location) => {
    setEditingLocation(location);
    setFormData({
      nombre: location.nombre,
      ip: location.ip,
      descripcion: location.descripcion || '',
      activo: location.activo,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    setFormData({
      nombre: '',
      ip: '',
      descripcion: '',
      activo: true,
    });
  };

  const validateIP = (ip) => {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip)) return false;

    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre) {
      toast({
        title: 'Campo requerido',
        description: 'El nombre de ubicación es obligatorio',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (!formData.ip) {
      toast({
        title: 'Campo requerido',
        description: 'La dirección IP es obligatoria',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (!validateIP(formData.ip)) {
      toast({
        title: 'IP inválida',
        description: 'Por favor ingrese una dirección IP válida (ej: 192.168.1.100)',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (editingLocation) {
      // Actualizar ubicación existente
      setLocations(
        locations.map((loc) =>
          loc.id === editingLocation.id
            ? { ...loc, ...formData }
            : loc
        )
      );
      toast({
        title: 'Ubicación actualizada',
        description: 'La ubicación ha sido actualizada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } else {
      // Agregar nueva ubicación
      const newLocation = {
        id: locations.length + 1,
        ...formData,
      };
      setLocations([...locations, newLocation]);
      toast({
        title: 'Ubicación agregada',
        description: 'La ubicación ha sido registrada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }

    closeModal();
  };

  const handleDelete = (id) => {
    setLocations(locations.filter((loc) => loc.id !== id));
    toast({
      title: 'Ubicación eliminada',
      description: 'La ubicación ha sido eliminada correctamente',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleToggleActive = (id) => {
    setLocations(
      locations.map((loc) =>
        loc.id === id ? { ...loc, activo: !loc.activo } : loc
      )
    );
  };

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Card>
        <CardHeader p='12px 5px'>
          <Flex justify='space-between' align='center'>
            <Box>
              <Text fontSize='xl' color={textColor} fontWeight='bold'>
                Ubicaciones Autorizadas del Restaurante
              </Text>
              <Text fontSize='sm' color='gray.500' mt={1}>
                Gestione las ubicaciones IP autorizadas para registro de asistencia del personal
              </Text>
            </Box>
            <Button
              leftIcon={<AddIcon />}
              colorScheme='blue'
              size='sm'
              onClick={openAddModal}
            >
              Agregar IP
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <Alert status='info' mb={4} borderRadius='md'>
            <AlertIcon />
            <Box flex='1'>
              <Text fontSize='sm' fontWeight='bold' mb={1}>
                ℹ️ Importante
              </Text>
              <AlertDescription fontSize='sm'>
                Registre la dirección IP de cada área del restaurante (caja, cocina, área de meseros, etc.)
                desde donde el personal registrará su asistencia. El sistema validará
                automáticamente que el empleado esté en la ubicación correcta al momento de registrar.
              </AlertDescription>
            </Box>
          </Alert>

          {locations.length === 0 ? (
            <Box textAlign='center' py={10}>
              <Text color='gray.500'>
                No hay ubicaciones registradas. Haga clic en "Agregar IP" para comenzar.
              </Text>
            </Box>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor}>Área del Restaurante</Th>
                  <Th borderColor={borderColor}>Dirección IP</Th>
                  <Th borderColor={borderColor}>Descripción</Th>
                  <Th borderColor={borderColor}>Estado</Th>
                  <Th borderColor={borderColor}>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {locations.map((location) => (
                  <Tr key={location.id}>
                    <Td borderColor={borderColor}>
                      <Text fontWeight='bold'>{location.nombre}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontFamily='monospace' fontSize='sm'>
                        {location.ip}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' color='gray.600'>
                        {location.descripcion || '-'}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Switch
                        colorScheme='green'
                        isChecked={location.activo}
                        onChange={() => handleToggleActive(location.id)}
                      />
                      <Badge
                        ml={2}
                        colorScheme={location.activo ? 'green' : 'red'}
                        fontSize='xs'
                      >
                        {location.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <IconButton
                        icon={<EditIcon />}
                        size='sm'
                        colorScheme='blue'
                        variant='ghost'
                        mr={2}
                        onClick={() => openEditModal(location)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size='sm'
                        colorScheme='red'
                        variant='ghost'
                        onClick={() => handleDelete(location.id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal para agregar/editar ubicación */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingLocation ? 'Editar Ubicación' : 'Agregar Nueva Ubicación'}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize='sm'>Área del Restaurante</FormLabel>
                  <Input
                    name='nombre'
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder='Ej: Caja Principal, Cocina, Área de Meseros, etc.'
                    bg={inputBg}
                  />
                  <Text fontSize='xs' color='gray.500' mt={1}>
                    Indique el área o zona del restaurante
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize='sm'>Dirección IP</FormLabel>
                  <Input
                    name='ip'
                    value={formData.ip}
                    onChange={handleChange}
                    placeholder='Ej: 192.168.1.100'
                    bg={inputBg}
                    fontFamily='monospace'
                  />
                  <Text fontSize='xs' color='gray.500' mt={1}>
                    Formato: xxx.xxx.xxx.xxx (IP del computador o tablet en esa área)
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize='sm'>Descripción</FormLabel>
                  <Textarea
                    name='descripcion'
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder='Ej: Punto de venta principal - Solo personal de caja puede registrar desde aquí'
                    bg={inputBg}
                    rows={3}
                  />
                  <Text fontSize='xs' color='gray.500' mt={1}>
                    Información adicional sobre esta ubicación (opcional)
                  </Text>
                </FormControl>

                <FormControl display='flex' alignItems='center'>
                  <FormLabel htmlFor='activo' mb='0' fontSize='sm'>
                    Estado
                  </FormLabel>
                  <Switch
                    id='activo'
                    name='activo'
                    colorScheme='green'
                    isChecked={formData.activo}
                    onChange={handleChange}
                  />
                  <Text ml={2} fontSize='sm' color='gray.600'>
                    {formData.activo ? 'Activo' : 'Inactivo'}
                  </Text>
                </FormControl>

                <Alert status='warning' borderRadius='md' fontSize='sm'>
                  <AlertIcon />
                  <AlertDescription>
                    Solo el personal que se conecte desde esta dirección IP podrá registrar su asistencia.
                    Asegúrese de que la IP sea correcta.
                  </AlertDescription>
                </Alert>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' mr={3} onClick={closeModal}>
                Cancelar
              </Button>
              <Button colorScheme='blue' type='submit'>
                {editingLocation ? 'Actualizar' : 'Agregar'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default AuthorizedLocations;
