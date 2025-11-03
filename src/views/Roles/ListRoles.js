import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import roleService from "services/roleService";

function ListRoles() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    hierarchyLevel: 1,
  });
  const cancelRef = React.useRef();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    const result = await roleService.getAllRoles();
    if (result.success) {
      setRoles(result.data);
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const result = await roleService.deleteRole(deleteId);
    if (result.success) {
      toast({
        title: "Rol eliminado",
        description: "El rol ha sido eliminado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadRoles();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const openEditDialog = (role) => {
    setEditingRole(role);
    setEditForm({
      name: role.name,
      description: role.description || '',
      hierarchyLevel: role.hierarchyLevel,
    });
    setIsEditOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditOpen(false);
    setEditingRole(null);
    setEditForm({
      name: '',
      description: '',
      hierarchyLevel: 1,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleHierarchyLevelChange = (value) => {
    setEditForm({
      ...editForm,
      hierarchyLevel: value,
    });
  };

  const handleEditSubmit = async () => {
    // Validaciones básicas
    if (!editForm.name) {
      toast({
        title: 'Campo requerido',
        description: 'El nombre del rol es obligatorio',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (!editForm.hierarchyLevel || editForm.hierarchyLevel < 1) {
      toast({
        title: 'Nivel inválido',
        description: 'El nivel jerárquico debe ser mayor a 0',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Preparar datos para actualizar
    const updateData = {
      name: editForm.name,
      description: editForm.description,
      hierarchyLevel: parseInt(editForm.hierarchyLevel),
    };

    const result = await roleService.updateRole(editingRole.id, updateData);

    if (result.success) {
      toast({
        title: 'Rol actualizado',
        description: 'El rol ha sido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadRoles();
      closeEditDialog();
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

  if (loading) {
    return (
      <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.300" />
        </Center>
      </Flex>
    );
  }

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Flex justify='space-between' align='center'>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Lista de Roles
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {roles.length} roles
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {roles.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay roles registrados
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Rol</Th>
                  <Th borderColor={borderColor} color='gray.400'>Descripción</Th>
                  <Th borderColor={borderColor} color='gray.400'>Nivel Jerárquico</Th>
                  <Th borderColor={borderColor} color='gray.400'>Fecha Creación</Th>
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {roles.map((role) => (
                  <Tr key={role.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>{role.name}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{role.description || "Sin descripción"}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={role.hierarchyLevel <= 3 ? "purple" : role.hierarchyLevel <= 6 ? "blue" : "gray"}
                        fontSize='sm'
                        p='3px 10px'
                        borderRadius='8px'>
                        Nivel {role.hierarchyLevel}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>
                        {role.createdAt ? new Date(role.createdAt).toLocaleDateString('es-BO') : 'N/A'}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='blue'
                        me='5px'
                        onClick={() => openEditDialog(role)}
                      >
                        Editar
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='red'
                        onClick={() => openDeleteDialog(role.id)}
                      >
                        Eliminar
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Alert Dialog para confirmar eliminación */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Eliminar Rol
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro? Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme='red' onClick={handleDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal para editar rol */}
      <Modal isOpen={isEditOpen} onClose={closeEditDialog} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Rol</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Nombre del Rol</FormLabel>
              <Input
                name='name'
                value={editForm.name}
                onChange={handleEditChange}
                placeholder='Nombre del rol'
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                name='description'
                value={editForm.description}
                onChange={handleEditChange}
                placeholder='Descripción del rol'
                rows={3}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Nivel Jerárquico</FormLabel>
              <NumberInput
                value={editForm.hierarchyLevel}
                onChange={(valueString) => handleHierarchyLevelChange(valueString)}
                min={1}
                max={10}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize='xs' color='gray.500' mt={1}>
                Nivel de jerarquía (1 = más alto, 10 = más bajo)
              </Text>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={closeEditDialog} mr={3}>
              Cancelar
            </Button>
            <Button colorScheme='blue' onClick={handleEditSubmit}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default ListRoles;
