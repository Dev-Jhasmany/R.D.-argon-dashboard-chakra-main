import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Text,
  Textarea,
  Select,
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
import productService from "services/productService";
import categoryService from "services/categoryService";

function RegisterProduct() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    unit: "",
    category_id: "",
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const cancelRef = React.useRef();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    const result = await categoryService.getAllCategories();
    if (result.success) {
      // Filtrar solo categorías activas
      const activeCategories = result.data.filter(c => c.is_active);
      setCategories(activeCategories);
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
    setLoadingCategories(false);
  };

  const loadProducts = async () => {
    setLoadingList(true);
    const result = await productService.getAllProducts();
    if (result.success) {
      setProducts(result.data);
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
    // Validaciones
    if (!formData.name || !formData.price || !formData.category_id) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (categories.length === 0) {
      toast({
        title: "Error",
        description: "Debe registrar al menos una categoría antes de crear productos",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: formData.stock ? parseFloat(formData.stock) : 0,
    };

    const result = await productService.createProduct(productData);

    setLoading(false);

    if (result.success) {
      toast({
        title: "Producto registrado",
        description: `Producto registrado con código: ${result.data.code}`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      // Limpiar formulario
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        unit: "",
        category_id: "",
      });
      loadProducts();
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

  const handleDelete = async () => {
    const result = await productService.deleteProduct(deleteId);
    if (result.success) {
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadProducts();
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

  const openEditModal = (product) => {
    setEditProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      unit: product.unit || "",
      category_id: product.category.id,
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
    if (!editFormData.name || !editFormData.price || !editFormData.category_id) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const productData = {
      ...editFormData,
      price: parseFloat(editFormData.price),
      stock: parseFloat(editFormData.stock),
    };

    const result = await productService.updateProduct(editProduct.id, productData);

    if (result.success) {
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadProducts();
      setIsEditOpen(false);
      setEditProduct(null);
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
    const result = await productService.toggleStatus(id);
    if (result.success) {
      toast({
        title: "Estado actualizado",
        description: "El estado del producto ha sido actualizado",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
      loadProducts();
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

  if (loadingCategories) {
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
      {/* Formulario de registro */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' mb='20px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Producto
          </Text>
        </CardHeader>
        <CardBody>
          {categories.length === 0 ? (
            <Center h="200px">
              <Flex direction='column' align='center'>
                <Text fontSize="lg" color="red.500" mb={3}>
                  ⚠️ No hay categorías registradas
                </Text>
                <Text fontSize="md" color="gray.500">
                  Debe registrar al menos una categoría antes de crear productos
                </Text>
              </Flex>
            </Center>
          ) : (
            <Flex direction='column' w='100%'>
              <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Nombre del Producto
                  </FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='text'
                    placeholder='Nombre del producto'
                    size='lg'
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Categoría
                  </FormLabel>
                  <Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    size='lg'
                    placeholder='Seleccione una categoría'>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid templateColumns='repeat(3, 1fr)' gap={6} mb='24px'>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Precio (Bs.)
                  </FormLabel>
                  <Input
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='number'
                    step='0.01'
                    placeholder='0.00'
                    size='lg'
                  />
                </FormControl>
                <FormControl>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Stock Inicial
                  </FormLabel>
                  <Input
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='number'
                    step='0.01'
                    placeholder='0'
                    size='lg'
                  />
                </FormControl>
                <FormControl>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Unidad
                  </FormLabel>
                  <Input
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='text'
                    placeholder='Ej: unidades, kg, litros'
                    size='lg'
                  />
                </FormControl>
              </Grid>
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
                  placeholder='Descripción detallada del producto (opcional)'
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
                REGISTRAR PRODUCTO
              </Button>
            </Flex>
          )}
        </CardBody>
      </Card>

      {/* Tabla de productos registrados */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Flex justify='space-between' align='center'>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Historial de Productos
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {products.length} productos
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {loadingList ? (
            <Center h="200px">
              <Spinner size="xl" color="teal.300" />
            </Center>
          ) : products.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay productos registrados
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Código</Th>
                  <Th borderColor={borderColor} color='gray.400'>Producto</Th>
                  <Th borderColor={borderColor} color='gray.400'>Categoría</Th>
                  <Th borderColor={borderColor} color='gray.400'>Precio</Th>
                  <Th borderColor={borderColor} color='gray.400'>Stock</Th>
                  <Th borderColor={borderColor} color='gray.400'>Estado</Th>
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((product) => (
                  <Tr key={product.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>{product.code}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>{product.name}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{product.category?.name || 'Sin categoría'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>Bs. {parseFloat(product.price).toFixed(2)}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{product.stock} {product.unit || ''}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={product.is_active ? 'green' : 'red'}
                        cursor='pointer'
                        onClick={() => handleToggleStatus(product.id)}
                        px='8px'
                        py='4px'
                        borderRadius='8px'>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='blue'
                        me='5px'
                        onClick={() => openEditModal(product)}>
                        Editar
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='red'
                        onClick={() => openDeleteDialog(product.id)}>
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

      {/* Modal para editar producto */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Producto</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='16px'>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Nombre del Producto</FormLabel>
                <Input
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleEditChange}
                  placeholder='Nombre del producto'
                  size='md'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Categoría</FormLabel>
                <Select
                  name="category_id"
                  value={editFormData.category_id || ""}
                  onChange={handleEditChange}
                  size='md'>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(3, 1fr)' gap={4} mb='16px'>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Precio (Bs.)</FormLabel>
                <Input
                  name="price"
                  value={editFormData.price || ""}
                  onChange={handleEditChange}
                  type='number'
                  step='0.01'
                  size='md'
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize='sm'>Stock</FormLabel>
                <Input
                  name="stock"
                  value={editFormData.stock || ""}
                  onChange={handleEditChange}
                  type='number'
                  step='0.01'
                  size='md'
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize='sm'>Unidad</FormLabel>
                <Input
                  name="unit"
                  value={editFormData.unit || ""}
                  onChange={handleEditChange}
                  size='md'
                />
              </FormControl>
            </Grid>
            <FormControl>
              <FormLabel fontSize='sm'>Descripción</FormLabel>
              <Textarea
                name="description"
                value={editFormData.description || ""}
                onChange={handleEditChange}
                placeholder='Descripción (opcional)'
                rows={3}
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
              Eliminar Producto
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

export default RegisterProduct;
