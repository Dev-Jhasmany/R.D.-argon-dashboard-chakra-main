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
  Avatar,
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
  Icon,
  ButtonGroup,
} from "@chakra-ui/react";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import userService from "services/userService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ListUsers() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const cancelRef = React.useRef();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

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
      });
      loadUsers();
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
                  <Tr key={user.id}>
                    <Td borderColor={borderColor}>
                      <Flex align='center'>
                        <Avatar
                          size='sm'
                          name={`${user.full_name || ''} ${user.full_last_name || ''}`}
                          me='10px'
                        />
                        <Text fontSize='sm' fontWeight='bold'>
                          {user.username}
                        </Text>
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
                      <Badge
                        colorScheme={user.is_active ? "green" : "red"}
                        fontSize='sm'
                        p='3px 10px'
                        borderRadius='8px'>
                        {user.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      {user.email === 'jhasmany@admin.com' ? (
                        <Badge colorScheme='gray' fontSize='xs' p='4px 8px' borderRadius='6px'>
                          Protegido
                        </Badge>
                      ) : (
                        <>
                          <Button size='sm' variant='outline' colorScheme='blue' me='5px'>
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
                        </>
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
    </Flex>
  );
}

export default ListUsers;
