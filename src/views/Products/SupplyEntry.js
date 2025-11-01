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
import supplierService from "services/supplierService";
import supplyEntryService from "services/supplyEntryService";

function SupplyEntry() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputTextColor = useColorModeValue("gray.800", "white");
  const readOnlyBg = useColorModeValue("gray.100", "gray.600");
  const toast = useToast();

  const [suppliers, setSuppliers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const cancelRef = React.useRef();

  const [formData, setFormData] = useState({
    product_name: "",
    quantity: "",
    unit: "",
    unit_price: "",
    total_price: "",
    minimum_stock: "",
    entry_date: new Date().toISOString().split('T')[0],
    expiration_date: "",
    notes: "",
    supplier_id: "",
  });

  useEffect(() => {
    loadSuppliers();
    loadEntries();
  }, []);

  const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    const result = await supplierService.getAllSuppliers();
    if (result.success) {
      const activeSuppliers = result.data.filter(s => s.is_active);
      setSuppliers(activeSuppliers);
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoadingSuppliers(false);
  };

  const loadEntries = async () => {
    const result = await supplyEntryService.getAllEntries();
    if (result.success) {
      setEntries(result.data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Calcular total_price automáticamente
      if (name === 'quantity' || name === 'unit_price') {
        const qty = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(prev.quantity) || 0;
        const price = name === 'unit_price' ? parseFloat(value) || 0 : parseFloat(prev.unit_price) || 0;
        updated.total_price = (qty * price).toFixed(2);
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.product_name || !formData.quantity || !formData.unit || !formData.unit_price || !formData.supplier_id || !formData.minimum_stock) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (suppliers.length === 0) {
      toast({
        title: "Error",
        description: "Debe registrar al menos un proveedor antes de crear entradas de insumos",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    const entryData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      unit_price: parseFloat(formData.unit_price),
      total_price: parseFloat(formData.total_price),
      minimum_stock: parseFloat(formData.minimum_stock),
    };

    const result = await supplyEntryService.createEntry(entryData);

    setLoading(false);

    if (result.success) {
      toast({
        title: "Entrada registrada",
        description: "La entrada de insumo ha sido registrada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Limpiar formulario
      setFormData({
        product_name: "",
        quantity: "",
        unit: "",
        unit_price: "",
        total_price: "",
        minimum_stock: "",
        entry_date: new Date().toISOString().split('T')[0],
        expiration_date: "",
        notes: "",
        supplier_id: "",
      });
      loadEntries();
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
    const result = await supplyEntryService.deleteEntry(deleteId);
    if (result.success) {
      toast({
        title: "Entrada eliminada",
        description: "La entrada ha sido eliminada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadEntries();
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

  const openEditModal = (entry) => {
    setEditEntry(entry);
    setEditFormData({
      product_name: entry.product_name,
      quantity: entry.quantity,
      unit: entry.unit,
      unit_price: entry.unit_price,
      total_price: entry.total_price,
      minimum_stock: entry.minimum_stock || "",
      entry_date: entry.entry_date,
      expiration_date: entry.expiration_date || "",
      notes: entry.notes || "",
      supplier_id: entry.supplier.id,
    });
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Calcular total_price automáticamente
      if (name === 'quantity' || name === 'unit_price') {
        const qty = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(prev.quantity) || 0;
        const price = name === 'unit_price' ? parseFloat(value) || 0 : parseFloat(prev.unit_price) || 0;
        updated.total_price = (qty * price).toFixed(2);
      }

      return updated;
    });
  };

  const handleUpdate = async () => {
    if (!editFormData.product_name || !editFormData.quantity || !editFormData.unit || !editFormData.unit_price || !editFormData.supplier_id || !editFormData.minimum_stock) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const entryData = {
      ...editFormData,
      quantity: parseFloat(editFormData.quantity),
      unit_price: parseFloat(editFormData.unit_price),
      total_price: parseFloat(editFormData.total_price),
      minimum_stock: parseFloat(editFormData.minimum_stock),
    };

    const result = await supplyEntryService.updateEntry(editEntry.id, entryData);

    if (result.success) {
      toast({
        title: "Entrada actualizada",
        description: "La entrada ha sido actualizada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadEntries();
      setIsEditOpen(false);
      setEditEntry(null);
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

  if (loadingSuppliers) {
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
            Entrada de Insumos
          </Text>
        </CardHeader>
        <CardBody>
          {suppliers.length === 0 ? (
            <Center h="200px">
              <Flex direction='column' align='center'>
                <Text fontSize="lg" color="red.500" mb={3}>
                  ⚠️ No hay proveedores registrados
                </Text>
                <Text fontSize="md" color="gray.500">
                  Debe registrar al menos un proveedor antes de crear entradas de insumos
                </Text>
              </Flex>
            </Center>
          ) : (
            <Flex direction='column' w='100%'>
              <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Producto/Insumo
                  </FormLabel>
                  <Input
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='text'
                    placeholder='Nombre del producto o insumo'
                    size='lg'
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Proveedor
                  </FormLabel>
                  <Select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    size='lg'
                    placeholder='Seleccione un proveedor'>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.company_name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid templateColumns='repeat(4, 1fr)' gap={6} mb='24px'>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Cantidad
                  </FormLabel>
                  <Input
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='number'
                    step='0.01'
                    placeholder='0.00'
                    size='lg'
                  />
                </FormControl>
                <FormControl isRequired>
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
                    placeholder='Ej: kg, litros, unidades'
                    size='lg'
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Fecha de Entrada
                  </FormLabel>
                  <Input
                    name="entry_date"
                    value={formData.entry_date}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='date'
                    size='lg'
                  />
                </FormControl>
                <FormControl>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Fecha de Caducidad
                  </FormLabel>
                  <Input
                    name="expiration_date"
                    value={formData.expiration_date}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='date'
                    size='lg'
                  />
                </FormControl>
              </Grid>
              <Grid templateColumns='repeat(3, 1fr)' gap={6} mb='24px'>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Precio Unitario
                  </FormLabel>
                  <Input
                    name="unit_price"
                    value={formData.unit_price}
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
                    Precio Total
                  </FormLabel>
                  <Input
                    name="total_price"
                    value={formData.total_price}
                    borderRadius='15px'
                    fontSize='sm'
                    type='number'
                    placeholder='0.00'
                    size='lg'
                    isReadOnly
                    bg={readOnlyBg}
                    color={inputTextColor}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Stock Mínimo
                  </FormLabel>
                  <Input
                    name="minimum_stock"
                    value={formData.minimum_stock}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='number'
                    step='0.01'
                    placeholder='0.00'
                    size='lg'
                  />
                </FormControl>
              </Grid>
              <FormControl mb='24px'>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Observaciones
                </FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  placeholder='Notas adicionales sobre la entrada'
                  rows={3}
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
                REGISTRAR ENTRADA
              </Button>
            </Flex>
          )}
        </CardBody>
      </Card>

      {/* Tabla de entradas registradas */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Flex justify='space-between' align='center'>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Historial de Entradas
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {entries.length} entradas
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {entries.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay entradas registradas
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Fecha</Th>
                  <Th borderColor={borderColor} color='gray.400'>F. Caducidad</Th>
                  <Th borderColor={borderColor} color='gray.400'>Producto</Th>
                  <Th borderColor={borderColor} color='gray.400'>Cantidad</Th>
                  <Th borderColor={borderColor} color='gray.400'>Stock Mínimo</Th>
                  <Th borderColor={borderColor} color='gray.400'>Precio Unit.</Th>
                  <Th borderColor={borderColor} color='gray.400'>Total</Th>
                  <Th borderColor={borderColor} color='gray.400'>Proveedor</Th>
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {entries.map((entry) => (
                  <Tr key={entry.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{new Date(entry.entry_date).toLocaleDateString()}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>
                        {entry.expiration_date
                          ? new Date(entry.expiration_date).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>{entry.product_name}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{entry.quantity} {entry.unit}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge colorScheme='green' fontSize='sm'>
                        {entry.minimum_stock || 1} {entry.unit}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>Bs. {parseFloat(entry.unit_price).toFixed(2)}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>Bs. {parseFloat(entry.total_price).toFixed(2)}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{entry.supplier?.company_name || 'N/A'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='blue'
                        me='5px'
                        onClick={() => openEditModal(entry)}>
                        Editar
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='red'
                        onClick={() => openDeleteDialog(entry.id)}>
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

      {/* Modal para editar entrada */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Entrada de Insumo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='16px'>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Producto/Insumo</FormLabel>
                <Input
                  name="product_name"
                  value={editFormData.product_name || ""}
                  onChange={handleEditChange}
                  placeholder='Nombre del producto'
                  size='md'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Proveedor</FormLabel>
                <Select
                  name="supplier_id"
                  value={editFormData.supplier_id || ""}
                  onChange={handleEditChange}
                  size='md'>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.company_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(4, 1fr)' gap={4} mb='16px'>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Cantidad</FormLabel>
                <Input
                  name="quantity"
                  value={editFormData.quantity || ""}
                  onChange={handleEditChange}
                  type='number'
                  step='0.01'
                  size='md'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Unidad</FormLabel>
                <Input
                  name="unit"
                  value={editFormData.unit || ""}
                  onChange={handleEditChange}
                  size='md'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Fecha</FormLabel>
                <Input
                  name="entry_date"
                  value={editFormData.entry_date || ""}
                  onChange={handleEditChange}
                  type='date'
                  size='md'
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize='sm'>F. Caducidad</FormLabel>
                <Input
                  name="expiration_date"
                  value={editFormData.expiration_date || ""}
                  onChange={handleEditChange}
                  type='date'
                  size='md'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(3, 1fr)' gap={4} mb='16px'>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Precio Unitario</FormLabel>
                <Input
                  name="unit_price"
                  value={editFormData.unit_price || ""}
                  onChange={handleEditChange}
                  type='number'
                  step='0.01'
                  size='md'
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize='sm'>Precio Total</FormLabel>
                <Input
                  name="total_price"
                  value={editFormData.total_price || ""}
                  type='number'
                  size='md'
                  isReadOnly
                  bg={readOnlyBg}
                  color={inputTextColor}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Stock Mínimo</FormLabel>
                <Input
                  name="minimum_stock"
                  value={editFormData.minimum_stock || ""}
                  onChange={handleEditChange}
                  type='number'
                  step='0.01'
                  size='md'
                />
              </FormControl>
            </Grid>
            <FormControl>
              <FormLabel fontSize='sm'>Observaciones</FormLabel>
              <Textarea
                name="notes"
                value={editFormData.notes || ""}
                onChange={handleEditChange}
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
              Eliminar Entrada
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

export default SupplyEntry;
