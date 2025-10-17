import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
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
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import categoryService from "services/categoryService";

function RegisterCategory() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const cancelRef = React.useRef();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingList(true);
    const result = await categoryService.getAllCategories();
    if (result.success) {
      setCategories(result.data);
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoadingList(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    const result = await categoryService.createCategory(formData);

    setLoading(false);

    if (result.success) {
      toast({
        title: "Categoría registrada",
        description: "La categoría ha sido registrada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Limpiar formulario
      setFormData({
        name: "",
        description: "",
      });
      loadCategories();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    const result = await categoryService.deleteCategory(deleteId);
    if (result.success) {
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadCategories();
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

  const openEditModal = (category) => {
    setEditCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || "",
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

  const handleUpdate = async () => {
    if (!editFormData.name) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await categoryService.updateCategory(editCategory.id, editFormData);

    if (result.success) {
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadCategories();
      setIsEditOpen(false);
      setEditCategory(null);
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleStatus = async (id) => {
    const result = await categoryService.toggleStatus(id);
    if (result.success) {
      toast({
        title: "Estado actualizado",
        description: "El estado de la categoría ha sido actualizado",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      loadCategories();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      {/* Formulario de registro */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' mb='20px' maxW='700px' mx='auto'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Categoría de Producto
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <FormControl mb='24px' isRequired>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Nombre de la Categoría
              </FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                type='text'
                placeholder='Ej: Bebidas, Comidas, Postres'
                size='lg'
              />
            </FormControl>

            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Descripción
              </FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                placeholder='Descripción de la categoría (opcional)'
                rows={4}
              />
            </FormControl>

            <Button
              onClick={handleSubmit}
              isLoading={loading}
              variant='dark'
              fontSize='sm'
              fontWeight='bold'
              w='200px'
              h='45px'
              mb='24px'>
              REGISTRAR CATEGORÍA
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {/* Tabla de categorías registradas */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Flex justify='space-between' align='center'>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Historial de Categorías
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {categories.length} categorías
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {loadingList ? (
            <Center h="200px">
              <Spinner size="xl" color="teal.300" />
            </Center>
          ) : categories.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay categorías registradas
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Nombre</Th>
                  <Th borderColor={borderColor} color='gray.400'>Descripción</Th>
                  <Th borderColor={borderColor} color='gray.400'>Estado</Th>
                  <Th borderColor={borderColor} color='gray.400'>Fecha Creación</Th>
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((category) => (
                  <Tr key={category.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>{category.name}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{category.description || 'Sin descripción'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={category.is_active ? 'green' : 'red'}
                        cursor='pointer'
                        onClick={() => handleToggleStatus(category.id)}
                        px='8px'
                        py='4px'
                        borderRadius='8px'>
                        {category.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{new Date(category.created_at).toLocaleDateString()}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='blue'
                        me='5px'
                        onClick={() => openEditModal(category)}>
                        Editar
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='red'
                        onClick={() => openDeleteDialog(category.id)}>
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

      {/* Modal para editar categoría */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Categoría</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb='16px' isRequired>
              <FormLabel fontSize='sm'>Nombre de la Categoría</FormLabel>
              <Input
                name="name"
                value={editFormData.name || ""}
                onChange={handleEditChange}
                placeholder='Nombre de la categoría'
                size='md'
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Descripción</FormLabel>
              <Textarea
                name="description"
                value={editFormData.description || ""}
                onChange={handleEditChange}
                placeholder='Descripción (opcional)'
                rows={4}
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
              Eliminar Categoría
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

export default RegisterCategory;
