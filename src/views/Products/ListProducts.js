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
  Select,
  Switch,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import productService from "services/productService";
import categoryService from "services/categoryService";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { Icon, ButtonGroup } from "@chakra-ui/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ListProducts() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    unit: '',
    category_id: '',
    is_active: true,
  });
  const cancelRef = React.useRef();

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
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
    setLoading(false);
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
        title: "No se puede eliminar",
        description: result.error,
        status: "warning",
        duration: 8000,
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

  const loadCategories = async () => {
    const result = await categoryService.getAllCategories();
    if (result.success) {
      setCategories(result.data);
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      unit: product.unit || '',
      category_id: product.category?.id || '',
      is_active: product.is_active,
    });
    setIsEditOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditOpen(false);
    setEditingProduct(null);
    setEditForm({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      unit: '',
      category_id: '',
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

  const handlePriceChange = (value) => {
    setEditForm({
      ...editForm,
      price: value,
    });
  };

  const handleStockChange = (value) => {
    setEditForm({
      ...editForm,
      stock: value,
    });
  };

  const handleEditSubmit = async () => {
    // Validaciones básicas
    if (!editForm.name) {
      toast({
        title: 'Campo requerido',
        description: 'El nombre del producto es obligatorio',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (!editForm.price || editForm.price <= 0) {
      toast({
        title: 'Precio inválido',
        description: 'El precio debe ser mayor a 0',
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
      price: parseFloat(editForm.price),
      stock: parseFloat(editForm.stock),
      unit: editForm.unit,
      category_id: editForm.category_id,
      is_active: editForm.is_active,
    };

    const result = await productService.updateProduct(editingProduct.id, updateData);

    if (result.success) {
      toast({
        title: 'Producto actualizado',
        description: 'El producto ha sido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadProducts();
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

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Agotado", color: "red" };
    if (stock < 10) return { label: "Bajo Stock", color: "orange" };
    return { label: "Disponible", color: "green" };
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Lista de Productos", 14, 20);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-BO')}`, 14, 28);

    // Preparar datos para la tabla
    const tableData = products.map(product => {
      const stockStatus = getStockStatus(product.stock || 0);
      return [
        product.name,
        product.sku || product.code || 'N/A',
        `$${product.price ? Number(product.price).toFixed(2) : '0.00'}`,
        product.stock || 0,
        product.unit || 'N/A',
        product.category?.name || 'Sin categoría',
        stockStatus.label
      ];
    });

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 35,
      head: [['Producto', 'SKU/Código', 'Precio', 'Stock', 'Unidad', 'Categoría', 'Estado']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 153, 225], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // Guardar PDF
    doc.save(`productos_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "PDF Generado",
      description: "La lista de productos ha sido exportada a PDF",
      status: "success",
      duration: 3000,
      isClosable: true,
        position: "top-right",
    });
  };

  // Exportar a Excel
  const exportToExcel = () => {
    // Preparar datos
    const excelData = products.map(product => {
      const stockStatus = getStockStatus(product.stock || 0);
      return {
        'Código': product.code || product.sku || 'N/A',
        'Producto': product.name,
        'Descripción': product.description || '',
        'Precio': product.price ? Number(product.price).toFixed(2) : '0.00',
        'Stock': product.stock || 0,
        'Unidad': product.unit || '',
        'Categoría': product.category?.name || 'Sin categoría',
        'Estado Stock': stockStatus.label,
        'Estado': product.is_active ? 'Activo' : 'Inactivo',
        'Fecha Creación': new Date(product.created_at).toLocaleString('es-BO'),
      };
    });

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 15 }, // Código
      { wch: 30 }, // Producto
      { wch: 40 }, // Descripción
      { wch: 10 }, // Precio
      { wch: 10 }, // Stock
      { wch: 12 }, // Unidad
      { wch: 20 }, // Categoría
      { wch: 15 }, // Estado Stock
      { wch: 10 }, // Estado
      { wch: 20 }, // Fecha
    ];
    ws['!cols'] = colWidths;

    // Generar archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `productos_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Excel Generado",
      description: "La lista de productos ha sido exportada a Excel",
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
              Lista de Productos
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
                {products.length} productos
              </Badge>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody>
          {products.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay productos registrados
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Producto</Th>
                  <Th borderColor={borderColor} color='gray.400'>SKU</Th>
                  <Th borderColor={borderColor} color='gray.400'>Precio</Th>
                  <Th borderColor={borderColor} color='gray.400'>Stock</Th>
                  <Th borderColor={borderColor} color='gray.400'>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0);
                  return (
                    <Tr key={product.id}>
                      <Td borderColor={borderColor}>
                        <Text fontSize='sm' fontWeight='bold'>{product.name}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize='sm'>{product.sku || 'N/A'}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize='sm' fontWeight='bold'>
                          ${product.price ? Number(product.price).toFixed(2) : '0.00'}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize='sm'>{product.stock || 0}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge
                          colorScheme={stockStatus.color}
                          fontSize='sm'
                          p='3px 10px'
                          borderRadius='8px'>
                          {stockStatus.label}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })}
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

      {/* Modal para editar producto */}
      <Modal isOpen={isEditOpen} onClose={closeEditDialog} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Producto</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Nombre del Producto</FormLabel>
              <Input
                name='name'
                value={editForm.name}
                onChange={handleEditChange}
                placeholder='Nombre del producto'
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                name='description'
                value={editForm.description}
                onChange={handleEditChange}
                placeholder='Descripción del producto'
                rows={3}
              />
            </FormControl>

            <Flex gap={4} mb={4}>
              <FormControl isRequired>
                <FormLabel>Precio</FormLabel>
                <NumberInput
                  value={editForm.price}
                  onChange={(valueString) => handlePriceChange(valueString)}
                  min={0}
                  precision={2}
                  step={0.01}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Stock</FormLabel>
                <NumberInput
                  value={editForm.stock}
                  onChange={(valueString) => handleStockChange(valueString)}
                  min={0}
                  precision={2}
                  step={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Flex>

            <Flex gap={4} mb={4}>
              <FormControl>
                <FormLabel>Unidad de Medida</FormLabel>
                <Input
                  name='unit'
                  value={editForm.unit}
                  onChange={handleEditChange}
                  placeholder='ej: kg, litros, unidades'
                />
              </FormControl>

              <FormControl>
                <FormLabel>Categoría</FormLabel>
                <Select
                  name='category_id'
                  value={editForm.category_id}
                  onChange={handleEditChange}
                  placeholder='Seleccionar categoría'
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Flex>

            <FormControl display='flex' alignItems='center'>
              <FormLabel mb='0'>Producto Activo</FormLabel>
              <Switch
                name='is_active'
                isChecked={editForm.is_active}
                onChange={handleEditChange}
                colorScheme='teal'
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

export default ListProducts;
