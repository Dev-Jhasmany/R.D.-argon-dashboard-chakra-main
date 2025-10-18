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
  Select,
  Checkbox,
  Stack,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import permissionService from "services/permissionService";
import roleService from "services/roleService";

function ListPermissions() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [editForm, setEditForm] = useState({
    role_id: '',
    menuCategory: '',
    submenus: [],
    description: '',
  });
  const cancelRef = React.useRef();

  // Opciones disponibles de categorías
  const menuCategories = [
    { value: 'users', label: 'Usuarios' },
    { value: 'roles', label: 'Roles y Permisos' },
    { value: 'products', label: 'Productos e Inventario' },
    { value: 'promotions', label: 'Promociones' },
    { value: 'suppliers', label: 'Proveedores' },
    { value: 'payments', label: 'Pagos' },
    { value: 'settings', label: 'Configuración' },
  ];

  // Submenús disponibles por categoría
  const availableSubmenus = {
    users: ['list', 'create', 'edit', 'delete', 'view'],
    roles: ['list', 'create', 'edit', 'delete', 'permissions'],
    products: ['list', 'create', 'edit', 'delete', 'stock', 'categories'],
    promotions: ['list', 'create', 'edit', 'delete', 'active'],
    suppliers: ['list', 'create', 'edit', 'delete', 'view'],
    payments: ['list', 'create', 'view', 'reports'],
    settings: ['general', 'users', 'system', 'security'],
  };

  useEffect(() => {
    loadPermissions();
    loadRoles();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    const result = await permissionService.getAllPermissions();
    if (result.success) {
      setPermissions(result.data);
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const result = await permissionService.deletePermission(deleteId);
    if (result.success) {
      toast({
        title: "Permiso eliminado",
        description: "El permiso ha sido eliminado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadPermissions();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const loadRoles = async () => {
    const result = await roleService.getAllRoles();
    if (result.success) {
      setRoles(result.data);
    }
  };

  const openEditDialog = (permission) => {
    setEditingPermission(permission);
    setEditForm({
      role_id: permission.role?.id || '',
      menuCategory: permission.menuCategory,
      submenus: permission.submenus || [],
      description: permission.description || '',
    });
    setIsEditOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditOpen(false);
    setEditingPermission(null);
    setEditForm({
      role_id: '',
      menuCategory: '',
      submenus: [],
      description: '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleSubmenuToggle = (submenu) => {
    const currentSubmenus = editForm.submenus || [];
    const newSubmenus = currentSubmenus.includes(submenu)
      ? currentSubmenus.filter(s => s !== submenu)
      : [...currentSubmenus, submenu];

    setEditForm({
      ...editForm,
      submenus: newSubmenus,
    });
  };

  const handleEditSubmit = async () => {
    // Validaciones básicas
    if (!editForm.role_id) {
      toast({
        title: 'Campo requerido',
        description: 'Debe seleccionar un rol',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!editForm.menuCategory) {
      toast({
        title: 'Campo requerido',
        description: 'Debe seleccionar una categoría de menú',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Preparar datos para actualizar
    const updateData = {
      role_id: editForm.role_id,
      menuCategory: editForm.menuCategory,
      submenus: editForm.submenus,
      description: editForm.description,
    };

    const result = await permissionService.updatePermission(editingPermission.id, updateData);

    if (result.success) {
      toast({
        title: 'Permiso actualizado',
        description: 'El permiso ha sido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadPermissions();
      closeEditDialog();
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

  const getCategoryLabel = (category) => {
    const labels = {
      users: 'Usuarios',
      roles: 'Roles y Permisos',
      products: 'Productos e Inventario',
      promotions: 'Promociones',
      suppliers: 'Proveedores',
      payments: 'Pagos',
      settings: 'Configuración'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      users: 'purple',
      roles: 'blue',
      products: 'green',
      promotions: 'orange',
      suppliers: 'cyan',
      payments: 'pink',
      settings: 'gray'
    };
    return colors[category] || 'gray';
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
              Lista de Permisos
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {permissions.length} permisos
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {permissions.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay permisos registrados
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Rol</Th>
                  <Th borderColor={borderColor} color='gray.400'>Categoría de Menú</Th>
                  <Th borderColor={borderColor} color='gray.400'>Submenús Permitidos</Th>
                  <Th borderColor={borderColor} color='gray.400'>Descripción</Th>
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {permissions.map((permission) => (
                  <Tr key={permission.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>
                        {permission.role?.name || 'Sin rol'}
                      </Text>
                      <Badge colorScheme='gray' fontSize='xs' mt={1}>
                        Nivel {permission.role?.hierarchyLevel || 'N/A'}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={getCategoryColor(permission.menuCategory)}
                        fontSize='sm'
                        p='3px 10px'
                        borderRadius='8px'
                      >
                        {getCategoryLabel(permission.menuCategory)}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Flex wrap='wrap' gap={1}>
                        {permission.submenus && permission.submenus.length > 0 ? (
                          permission.submenus.map((submenu, idx) => (
                            <Badge
                              key={idx}
                              colorScheme='teal'
                              fontSize='xs'
                              p='2px 8px'
                              borderRadius='6px'
                              mb={1}
                            >
                              {submenu}
                            </Badge>
                          ))
                        ) : (
                          <Text fontSize='xs' color='gray.500'>Sin submenús</Text>
                        )}
                      </Flex>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{permission.description || "Sin descripción"}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='blue'
                        me='5px'
                        onClick={() => openEditDialog(permission)}
                      >
                        Editar
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='red'
                        onClick={() => openDeleteDialog(permission.id)}
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
              Eliminar Permiso
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

      {/* Modal para editar permiso */}
      <Modal isOpen={isEditOpen} onClose={closeEditDialog} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Permiso</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Rol</FormLabel>
              <Select
                name='role_id'
                value={editForm.role_id}
                onChange={handleEditChange}
                placeholder='Seleccionar rol'
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} - Nivel {role.hierarchyLevel}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Categoría de Menú</FormLabel>
              <Select
                name='menuCategory'
                value={editForm.menuCategory}
                onChange={handleEditChange}
                placeholder='Seleccionar categoría'
              >
                {menuCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Submenús Permitidos</FormLabel>
              <Stack spacing={2} mt={2}>
                {editForm.menuCategory && availableSubmenus[editForm.menuCategory]?.map((submenu) => (
                  <Checkbox
                    key={submenu}
                    isChecked={editForm.submenus.includes(submenu)}
                    onChange={() => handleSubmenuToggle(submenu)}
                  >
                    {submenu}
                  </Checkbox>
                ))}
                {!editForm.menuCategory && (
                  <Text fontSize='sm' color='gray.500'>
                    Primero seleccione una categoría de menú
                  </Text>
                )}
              </Stack>
            </FormControl>

            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                name='description'
                value={editForm.description}
                onChange={handleEditChange}
                placeholder='Descripción del permiso'
                rows={3}
              />
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

export default ListPermissions;
