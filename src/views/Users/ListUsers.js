import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Avatar,
  Badge,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Icon,
  ButtonGroup,
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
  Select,
  Switch,
} from "@chakra-ui/react";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import userService from "services/userService";
import roleService from "services/roleService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ListUsers() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inactiveBgColor = useColorModeValue("gray.50", "gray.700");
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    ci: '',
    full_name: '',
    full_last_name: '',
    role_id: '',
    is_active: true,
  });
  const cancelRef = React.useRef();

  // Cargar usuarios y roles al montar el componente
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const result = await roleService.getAllRoles();
    if (result.success) {
      setRoles(result.data);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    const result = await userService.getAllUsers();
    if (result.success) {
      setUsers(result.data);
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
    const result = await userService.deleteUser(deleteId);
    if (result.success) {
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadUsers();
    } else {
      const userToHandle = users.find(u => u.id === deleteId);

      // Verificar si el error es por caja abierta
      if (result.error.includes('caja abierta') || result.error.includes('debe cerrar la caja')) {
        setIsDeleteOpen(false);

        toast({
          title: "Caja abierta - No se puede eliminar",
          description: `${userToHandle?.username || 'Este usuario'} tiene una caja abierta. Solo el mismo cajero o un administrador puede cerrarla. RECOMENDACIÓN: En lugar de eliminar, desactiva al usuario haciendo clic en el badge de estado. Esto impide que inicie sesión mientras mantiene sus registros intactos.`,
          status: "warning",
          duration: 12000,
          isClosable: true,
          position: "top-right",
        });

        setDeleteId(null);
        return;
      }

      // Si es error de registros asociados (cajas cerradas, ventas, etc.)
      if (result.status === 500 ||
          result.error.includes('dependen') ||
          result.error.includes('relacionad') ||
          result.error.includes('asociados') ||
          result.error.includes('servidor')) {

        setIsDeleteOpen(false);

        // Si tiene registros históricos pero NO cajas abiertas, puede desactivarse
        toast({
          title: "Registros históricos",
          description: `${userToHandle?.username || 'Este usuario'} tiene registros históricos (ventas cerradas, asistencias, etc.). Si ya no trabaja, puedes desactivarlo haciendo clic en el badge de estado.`,
          status: "info",
          duration: 6000,
          isClosable: true,
          position: "top-right",
        });

        setDeleteId(null);
        return;
      }

      toast({
        title: "Error al eliminar",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  const openToggleDialog = (user) => {
    setUserToToggle(user);
    setIsToggleOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!userToToggle) return;

    // Intentar actualizar el estado
    const result = await userService.updateUser(userToToggle.id, {
      is_active: !userToToggle.is_active,
      username: userToToggle.username,
      email: userToToggle.email,
      ci: userToToggle.ci,
      full_name: userToToggle.full_name,
      full_last_name: userToToggle.full_last_name,
      role_id: userToToggle.role?.id,
    });

    if (result.success) {
      toast({
        title: userToToggle.is_active ? "Usuario desactivado" : "Usuario activado",
        description: userToToggle.is_active
          ? `${userToToggle.username} no podrá iniciar sesión. Sus registros históricos se mantienen.`
          : `${userToToggle.username} ahora puede iniciar sesión en el sistema.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      loadUsers();
    } else {
      toast({
        title: "Error al actualizar usuario",
        description: result.error || "No se pudo cambiar el estado del usuario",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }

    setIsToggleOpen(false);
    setUserToToggle(null);
  };

  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      ci: user.ci || '',
      full_name: user.full_name || '',
      full_last_name: user.full_last_name || '',
      role_id: user.role?.id || '',
      is_active: user.is_active,
    });
    setIsEditOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditOpen(false);
    setEditingUser(null);
    setEditForm({
      username: '',
      email: '',
      ci: '',
      full_name: '',
      full_last_name: '',
      role_id: '',
      is_active: true,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleEditSubmit = async () => {
    // Validaciones básicas
    if (!editForm.username || !editForm.email) {
      toast({
        title: 'Campos requeridos',
        description: 'Usuario y email son obligatorios',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Preparar datos para actualizar (sin password)
    const updateData = {
      username: editForm.username,
      email: editForm.email,
      ci: editForm.ci,
      full_name: editForm.full_name,
      full_last_name: editForm.full_last_name,
      role_id: editForm.role_id,
      is_active: editForm.is_active,
    };

    const result = await userService.updateUser(editingUser.id, updateData);

    if (result.success) {
      toast({
        title: 'Usuario actualizado',
        description: 'El usuario ha sido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadUsers();
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

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Lista de Usuarios", 14, 20);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-BO')}`, 14, 28);

    // Preparar datos para la tabla
    const tableData = users.map(user => [
      user.username,
      user.email,
      user.ci || 'N/A',
      `${user.full_name || ''} ${user.full_last_name || ''}`.trim() || 'N/A',
      user.role?.name || 'Sin rol',
      `Nivel ${user.role?.hierarchyLevel || 'N/A'}`,
      user.is_active ? 'Activo' : 'Inactivo'
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 35,
      head: [['Usuario', 'Email', 'CI', 'Nombres', 'Rol', 'Nivel', 'Estado']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 153, 225], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // Guardar PDF
    doc.save(`usuarios_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "PDF Generado",
      description: "La lista de usuarios ha sido exportada a PDF",
      status: "success",
      duration: 3000,
      isClosable: true,
        position: "top-right",
    });
  };

  // Exportar a Excel
  const exportToExcel = () => {
    // Preparar datos
    const excelData = users.map(user => ({
      'Usuario': user.username,
      'Email': user.email,
      'CI': user.ci || 'N/A',
      'Nombres': user.full_name || '',
      'Apellidos': user.full_last_name || '',
      'Nombres Completos': `${user.full_name || ''} ${user.full_last_name || ''}`.trim() || 'N/A',
      'Rol': user.role?.name || 'Sin rol',
      'Nivel Jerárquico': user.role?.hierarchyLevel || 'N/A',
      'Estado': user.is_active ? 'Activo' : 'Inactivo',
      'Fecha Creación': new Date(user.created_at).toLocaleString('es-BO'),
    }));

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 15 }, // Usuario
      { wch: 25 }, // Email
      { wch: 12 }, // CI
      { wch: 20 }, // Nombres
      { wch: 20 }, // Apellidos
      { wch: 30 }, // Nombres Completos
      { wch: 20 }, // Rol
      { wch: 15 }, // Nivel
      { wch: 10 }, // Estado
      { wch: 20 }, // Fecha
    ];
    ws['!cols'] = colWidths;

    // Generar archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Excel Generado",
      description: "La lista de usuarios ha sido exportada a Excel",
      status: "success",
      duration: 3000,
      isClosable: true,
        position: "top-right",
    });
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
          <Flex justify='space-between' align='center' flexWrap='wrap' gap={4}>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Lista de Usuarios
            </Text>
            <Flex align='center' gap={3}>
              <ButtonGroup size='sm' isAttached variant='outline'>
                <Button
                  leftIcon={<Icon as={FaFilePdf} />}
                  colorScheme='red'
                  onClick={exportToPDF}
                >
                  Exportar PDF
                </Button>
                <Button
                  leftIcon={<Icon as={FaFileExcel} />}
                  colorScheme='green'
                  onClick={exportToExcel}
                >
                  Exportar Excel
                </Button>
              </ButtonGroup>
              <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
                {users.length} usuarios
              </Badge>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody>
          {users.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay usuarios registrados
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>
                    Usuario
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Email
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    CI
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Nombres Completos
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Rol
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
                {users.map((user) => (
                  <Tr key={user.id} opacity={user.is_active ? 1 : 0.6} bg={user.is_active ? 'transparent' : inactiveBgColor}>
                    <Td borderColor={borderColor}>
                      <Flex align='center'>
                        <Avatar
                          size='sm'
                          name={`${user.full_name || ''} ${user.full_last_name || ''}`}
                          me='10px'
                        />
                        <Flex direction='column'>
                          <Text fontSize='sm' fontWeight='bold'>
                            {user.username}
                          </Text>
                          {user.email === 'tienda-online@sistema.local' && (
                            <Badge colorScheme='orange' fontSize='xs' mt={1} w='fit-content'>
                              Sistema
                            </Badge>
                          )}
                          {!user.is_active && (
                            <Badge colorScheme='red' fontSize='xs' mt={1} w='fit-content'>
                              Inactivo
                            </Badge>
                          )}
                        </Flex>
                      </Flex>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{user.email}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{user.ci || 'N/A'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>
                        {user.full_name && user.full_last_name
                          ? `${user.full_name} ${user.full_last_name}`
                          : 'N/A'
                        }
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      {user.role ? (
                        <Flex direction='column'>
                          <Text fontSize='sm' fontWeight='bold'>
                            {user.role.name}
                          </Text>
                          <Badge colorScheme='purple' fontSize='xs' mt={1} w='fit-content'>
                            Nivel {user.role.hierarchyLevel}
                          </Badge>
                        </Flex>
                      ) : (
                        <Text fontSize='sm' color='gray.500'>Sin rol</Text>
                      )}
                    </Td>
                    <Td borderColor={borderColor}>
                      {user.email === 'jhasmany@admin.com' || user.email === 'tienda-online@sistema.local' ? (
                        <Badge
                          colorScheme={user.is_active ? "green" : "red"}
                          fontSize='sm'
                          p='3px 10px'
                          borderRadius='8px'>
                          {user.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      ) : (
                        <Badge
                          colorScheme={user.is_active ? "green" : "red"}
                          fontSize='sm'
                          p='6px 12px'
                          borderRadius='8px'
                          cursor='pointer'
                          onClick={() => openToggleDialog(user)}
                          _hover={{
                            opacity: 0.8,
                            transform: 'scale(1.05)',
                          }}
                          transition='all 0.2s'
                          title={user.is_active ? 'Haz clic para desactivar' : 'Haz clic para activar'}
                        >
                          {user.is_active ? "Activo ▼" : "Inactivo ▲"}
                        </Badge>
                      )}
                    </Td>
                    <Td borderColor={borderColor}>
                      {user.email === 'jhasmany@admin.com' || user.email === 'tienda-online@sistema.local' ? (
                        <Badge colorScheme='gray' fontSize='xs' p='4px 8px' borderRadius='6px'>
                          Protegido
                        </Badge>
                      ) : (
                        <Flex gap={2} flexWrap='wrap'>
                          <Button
                            size='sm'
                            variant='outline'
                            colorScheme='blue'
                            onClick={() => openEditDialog(user)}
                          >
                            Editar
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            colorScheme='red'
                            onClick={() => openDeleteDialog(user.id)}
                          >
                            Eliminar
                          </Button>
                        </Flex>
                      )}
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
              Eliminar Usuario
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align='start' spacing={3}>
                <Text>
                  ¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.
                </Text>
                <Box bg='red.50' p={3} borderRadius='md' borderLeft='4px solid' borderColor='red.400'>
                  <Text fontSize='sm' fontWeight='bold' color='red.800' mb={1}>
                    🚫 No se puede eliminar si:
                  </Text>
                  <Text fontSize='sm' color='red.700' mb={1}>
                    • Tiene una <strong>caja abierta</strong> (solo el mismo cajero o admin puede cerrarla)
                  </Text>
                  <Text fontSize='sm' color='red.700'>
                    • Tiene pedidos activos o pagos pendientes
                  </Text>
                </Box>
                <Box bg='green.50' p={3} borderRadius='md' borderLeft='4px solid' borderColor='green.400'>
                  <Text fontSize='sm' fontWeight='bold' color='green.800' mb={1}>
                    ✅ RECOMENDADO: Desactivar usuario
                  </Text>
                  <Text fontSize='sm' color='green.700' mb={2}>
                    Si el usuario ya no trabaja, <strong>desactívalo</strong> en lugar de eliminarlo.
                    Haz clic en el badge <Badge colorScheme='green' fontSize='xs'>Activo</Badge> en la columna ESTADO.
                  </Text>
                  <Text fontSize='sm' color='green.700' fontWeight='bold'>
                    Ventajas: No podrá iniciar sesión, no afecta operaciones activas, mantiene registros históricos.
                  </Text>
                </Box>
              </VStack>
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

      {/* Alert Dialog para confirmar cambio de estado */}
      <AlertDialog
        isOpen={isToggleOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsToggleOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {userToToggle?.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
            </AlertDialogHeader>

            <AlertDialogBody>
              {userToToggle?.is_active ? (
                <>
                  ¿Desactivar a <strong>{userToToggle?.username}</strong>?
                  El usuario no podrá iniciar sesión pero sus registros se mantendrán.
                </>
              ) : (
                <>
                  ¿Activar a <strong>{userToToggle?.username}</strong>?
                  El usuario podrá iniciar sesión nuevamente.
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsToggleOpen(false)}>
                Cancelar
              </Button>
              <Button
                colorScheme={userToToggle?.is_active ? 'orange' : 'green'}
                onClick={handleToggleStatus}
                ml={3}
              >
                {userToToggle?.is_active ? 'Desactivar' : 'Activar'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal para editar usuario */}
      <Modal isOpen={isEditOpen} onClose={closeEditDialog} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Usuario</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Usuario</FormLabel>
              <Input
                name='username'
                value={editForm.username}
                onChange={handleEditChange}
                placeholder='Nombre de usuario'
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                name='email'
                type='email'
                value={editForm.email}
                onChange={handleEditChange}
                placeholder='Email'
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>CI</FormLabel>
              <Input
                name='ci'
                value={editForm.ci}
                onChange={handleEditChange}
                placeholder='Carnet de Identidad'
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Nombres</FormLabel>
              <Input
                name='full_name'
                value={editForm.full_name}
                onChange={handleEditChange}
                placeholder='Nombres completos'
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Apellidos</FormLabel>
              <Input
                name='full_last_name'
                value={editForm.full_last_name}
                onChange={handleEditChange}
                placeholder='Apellidos completos'
              />
            </FormControl>

            <FormControl mb={4}>
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

            <Box bg={editForm.is_active ? 'green.50' : 'red.50'} p={4} borderRadius='md' borderLeft='4px solid' borderColor={editForm.is_active ? 'green.400' : 'red.400'} mb={4}>
              <FormControl display='flex' alignItems='center' justifyContent='space-between'>
                <VStack align='start' spacing={1}>
                  <FormLabel mb='0' fontWeight='bold' color={editForm.is_active ? 'green.800' : 'red.800'}>
                    Estado del Usuario
                  </FormLabel>
                  <Text fontSize='sm' color={editForm.is_active ? 'green.700' : 'red.700'}>
                    {editForm.is_active
                      ? '✓ El usuario PUEDE iniciar sesión en el sistema'
                      : '✗ El usuario NO PUEDE iniciar sesión (Desactivado)'}
                  </Text>
                </VStack>
                <Switch
                  name='is_active'
                  size='lg'
                  isChecked={editForm.is_active}
                  onChange={handleEditChange}
                  colorScheme={editForm.is_active ? 'green' : 'red'}
                />
              </FormControl>
              {!editForm.is_active && (
                <Text fontSize='xs' color='orange.700' mt={2}>
                  <strong>Nota:</strong> Los registros históricos del usuario (ventas, asistencias) se mantienen intactos.
                </Text>
              )}
            </Box>
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

export default ListUsers;
