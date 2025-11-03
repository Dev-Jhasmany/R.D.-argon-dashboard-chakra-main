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
  Grid,
  Textarea,
  Switch,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import supplierService from "services/supplierService";

function ListSuppliers() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const cancelRef = React.useRef();

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    const result = await supplierService.getAllSuppliers();
    if (result.success) {
      setSuppliers(result.data);
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
    const result = await supplierService.deleteSupplier(deleteId);
    if (result.success) {
      toast({
        title: "Proveedor eliminado",
        description: "El proveedor ha sido eliminado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadSuppliers();
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

  const openEditModal = (supplier) => {
    setEditSupplier(supplier);
    setEditFormData({
      company_name: supplier.company_name,
      ruc: supplier.ruc || "",
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone_number: supplier.phone_number || "",
      address: supplier.address || "",
      description: supplier.description || "",
      is_active: supplier.is_active,
    });
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSwitchChange = (e) => {
    setEditFormData((prev) => ({
      ...prev,
      is_active: e.target.checked,
    }));
  };

  const handleUpdate = async () => {
    if (!editFormData.company_name) {
      toast({
        title: "Error",
        description: "El nombre de la empresa es requerido",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const result = await supplierService.updateSupplier(editSupplier.id, editFormData);

    if (result.success) {
      toast({
        title: "Proveedor actualizado",
        description: "El proveedor ha sido actualizado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadSuppliers();
      setIsEditOpen(false);
      setEditSupplier(null);
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
  };

  const handleToggleStatus = async (id) => {
    const result = await supplierService.toggleStatus(id);
    if (result.success) {
      toast({
        title: "Estado actualizado",
        description: "El estado del proveedor ha sido actualizado",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadSuppliers();
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
              Lista de Proveedores
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {suppliers.length} proveedores
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {suppliers.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay proveedores registrados
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>
                    Empresa
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    RUC
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Contacto
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Teléfono
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Email
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
                {suppliers.map((supplier) => (
                  <Tr key={supplier.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>
                        {supplier.company_name}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{supplier.ruc || 'N/A'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{supplier.contact_person || 'N/A'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{supplier.phone_number || 'N/A'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{supplier.email || 'N/A'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={supplier.is_active ? "green" : "red"}
                        fontSize='sm'
                        p='3px 10px'
                        borderRadius='8px'
                        cursor='pointer'
                        onClick={() => handleToggleStatus(supplier.id)}>
                        {supplier.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='blue'
                        me='5px'
                        onClick={() => openEditModal(supplier)}>
                        Editar
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='red'
                        onClick={() => openDeleteDialog(supplier.id)}>
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

      {/* Modal para editar proveedor */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Proveedor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='16px'>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Nombre del Proveedor</FormLabel>
                <Input
                  name="company_name"
                  value={editFormData.company_name || ""}
                  onChange={handleEditChange}
                  placeholder='Nombre de la empresa'
                  size='md'
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize='sm'>RUC/NIT</FormLabel>
                <Input
                  name="ruc"
                  value={editFormData.ruc || ""}
                  onChange={handleEditChange}
                  placeholder='Número de identificación'
                  size='md'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='16px'>
              <FormControl>
                <FormLabel fontSize='sm'>Persona de Contacto</FormLabel>
                <Input
                  name="contact_person"
                  value={editFormData.contact_person || ""}
                  onChange={handleEditChange}
                  placeholder='Nombre del contacto'
                  size='md'
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize='sm'>Email</FormLabel>
                <Input
                  name="email"
                  value={editFormData.email || ""}
                  onChange={handleEditChange}
                  type='email'
                  placeholder='correo@proveedor.com'
                  size='md'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='16px'>
              <FormControl>
                <FormLabel fontSize='sm'>Teléfono</FormLabel>
                <Input
                  name="phone_number"
                  value={editFormData.phone_number || ""}
                  onChange={handleEditChange}
                  placeholder='Número de contacto'
                  size='md'
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize='sm'>Dirección</FormLabel>
                <Input
                  name="address"
                  value={editFormData.address || ""}
                  onChange={handleEditChange}
                  placeholder='Dirección completa'
                  size='md'
                />
              </FormControl>
            </Grid>
            <FormControl mb='16px'>
              <FormLabel fontSize='sm'>Descripción</FormLabel>
              <Textarea
                name="description"
                value={editFormData.description || ""}
                onChange={handleEditChange}
                placeholder='Información adicional del proveedor'
                rows={3}
              />
            </FormControl>
            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='edit_is_active' mb='0' fontSize='sm'>
                Estado Activo
              </FormLabel>
              <Switch
                id='edit_is_active'
                isChecked={editFormData.is_active}
                onChange={handleEditSwitchChange}
                colorScheme='teal'
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button colorScheme='blue' onClick={handleUpdate}>
              Actualizar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alert Dialog para confirmar eliminación */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Eliminar Proveedor
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

export default ListSuppliers;
