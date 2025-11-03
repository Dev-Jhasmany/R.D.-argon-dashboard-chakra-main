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
import supplyEntryService from "services/supplyEntryService";
import wasteReportService from "services/wasteReportService";

function WasteReport() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputTextColor = useColorModeValue("gray.800", "white");
  const readOnlyBg = useColorModeValue("gray.100", "gray.600");
  const toast = useToast();

  const [supplies, setSupplies] = useState([]);
  const [wasteReports, setWasteReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSupplies, setLoadingSupplies] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editReport, setEditReport] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const cancelRef = React.useRef();

  const [formData, setFormData] = useState({
    supply_entry_id: "",
    waste_quantity: "",
    waste_date: new Date().toISOString().split('T')[0],
    reason: "",
    notes: "",
  });

  useEffect(() => {
    loadSupplies();
    loadWasteReports();
  }, []);

  const loadSupplies = async () => {
    setLoadingSupplies(true);
    const result = await supplyEntryService.getAllEntries();
    if (result.success) {
      setSupplies(result.data);
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
    setLoadingSupplies(false);
  };

  const loadWasteReports = async () => {
    const result = await wasteReportService.getAllReports();
    if (result.success) {
      // Transformar datos para incluir información del supply entry
      const reportsWithSupplyInfo = result.data.map(report => ({
        ...report,
        product_name: report.supplyEntry?.product_name || 'N/A',
        unit: report.supplyEntry?.unit || '',
        supply_entry_id: report.supplyEntry?.id || '',
      }));
      setWasteReports(reportsWithSupplyInfo);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSelectedSupply = () => {
    if (!formData.supply_entry_id) return null;
    return supplies.find(s => s.id === formData.supply_entry_id);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.supply_entry_id || !formData.waste_quantity || !formData.reason) {
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

    const selectedSupply = getSelectedSupply();
    if (!selectedSupply) {
      toast({
        title: "Error",
        description: "Insumo no encontrado",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const wasteQty = parseFloat(formData.waste_quantity);
    const availableQty = parseFloat(selectedSupply.quantity);

    if (wasteQty <= 0) {
      toast({
        title: "Error",
        description: "La cantidad desperdiciada debe ser mayor a 0",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (wasteQty > availableQty) {
      toast({
        title: "Error",
        description: `La cantidad desperdiciada no puede ser mayor a la cantidad disponible (${availableQty} ${selectedSupply.unit})`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    const wasteData = {
      ...formData,
      waste_quantity: wasteQty,
    };

    const result = await wasteReportService.createReport(wasteData);

    if (result.success) {
      toast({
        title: "Desperdicio registrado",
        description: "El reporte de desperdicio ha sido registrado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      // Limpiar formulario
      setFormData({
        supply_entry_id: "",
        waste_quantity: "",
        waste_date: new Date().toISOString().split('T')[0],
        reason: "",
        notes: "",
      });

      // Recargar listas
      loadWasteReports();
      loadSupplies(); // Recargar supplies para actualizar cantidades
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
    const result = await wasteReportService.deleteReport(deleteId);

    if (result.success) {
      toast({
        title: "Reporte eliminado",
        description: "El reporte ha sido eliminado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadWasteReports();
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

  const openEditModal = (report) => {
    setEditReport(report);
    setEditFormData({
      supply_entry_id: report.supply_entry_id,
      waste_quantity: report.waste_quantity,
      waste_date: report.waste_date,
      reason: report.reason,
      notes: report.notes || "",
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
    if (!editFormData.supply_entry_id || !editFormData.waste_quantity || !editFormData.reason) {
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

    const updateData = {
      supply_entry_id: editFormData.supply_entry_id,
      waste_quantity: parseFloat(editFormData.waste_quantity),
      waste_date: editFormData.waste_date,
      reason: editFormData.reason,
      notes: editFormData.notes,
    };

    const result = await wasteReportService.updateReport(editReport.id, updateData);

    if (result.success) {
      toast({
        title: "Reporte actualizado",
        description: "El reporte ha sido actualizado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadWasteReports();
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

    setIsEditOpen(false);
    setEditReport(null);
  };

  if (loadingSupplies) {
    return (
      <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.300" />
        </Center>
      </Flex>
    );
  }

  const selectedSupply = getSelectedSupply();

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      {/* Formulario de registro */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' mb='20px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Reporte de Desperdicios
          </Text>
        </CardHeader>
        <CardBody>
          {supplies.length === 0 ? (
            <Center h="200px">
              <Flex direction='column' align='center'>
                <Text fontSize="lg" color="red.500" mb={3}>
                  ⚠️ No hay insumos registrados
                </Text>
                <Text fontSize="md" color="gray.500">
                  Debe registrar al menos una entrada de insumo antes de reportar desperdicios
                </Text>
              </Flex>
            </Center>
          ) : (
            <Flex direction='column' w='100%'>
              <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Seleccionar Insumo
                  </FormLabel>
                  <Select
                    name="supply_entry_id"
                    value={formData.supply_entry_id}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    size='lg'
                    placeholder='Seleccione un insumo'>
                    {supplies.map((supply) => (
                      <option key={supply.id} value={supply.id}>
                        {supply.product_name} - {supply.quantity} {supply.unit} ({new Date(supply.entry_date).toLocaleDateString()})
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Fecha de Desperdicio
                  </FormLabel>
                  <Input
                    name="waste_date"
                    value={formData.waste_date}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='date'
                    size='lg'
                  />
                </FormControl>
              </Grid>

              {selectedSupply && (
                <Card bg={readOnlyBg} p='15px' mb='24px' borderRadius='15px'>
                  <Text fontSize='sm' color={textColor} fontWeight='bold' mb='10px'>
                    Información del Insumo Seleccionado:
                  </Text>
                  <Grid templateColumns='repeat(3, 1fr)' gap={4}>
                    <Flex direction='column'>
                      <Text fontSize='xs' color='gray.500'>Producto</Text>
                      <Text fontSize='sm' fontWeight='bold'>{selectedSupply.product_name}</Text>
                    </Flex>
                    <Flex direction='column'>
                      <Text fontSize='xs' color='gray.500'>Cantidad Disponible</Text>
                      <Text fontSize='sm' fontWeight='bold'>{selectedSupply.quantity} {selectedSupply.unit}</Text>
                    </Flex>
                    <Flex direction='column'>
                      <Text fontSize='xs' color='gray.500'>Proveedor</Text>
                      <Text fontSize='sm' fontWeight='bold'>{selectedSupply.supplier?.company_name || 'N/A'}</Text>
                    </Flex>
                    <Flex direction='column'>
                      <Text fontSize='xs' color='gray.500'>Fecha de Entrada</Text>
                      <Text fontSize='sm'>{new Date(selectedSupply.entry_date).toLocaleDateString()}</Text>
                    </Flex>
                    <Flex direction='column'>
                      <Text fontSize='xs' color='gray.500'>Fecha de Caducidad</Text>
                      <Text fontSize='sm'>
                        {selectedSupply.expiration_date
                          ? new Date(selectedSupply.expiration_date).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </Flex>
                    <Flex direction='column'>
                      <Text fontSize='xs' color='gray.500'>Precio Unitario</Text>
                      <Text fontSize='sm'>Bs. {parseFloat(selectedSupply.unit_price).toFixed(2)}</Text>
                    </Flex>
                  </Grid>
                </Card>
              )}

              <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Cantidad Desperdiciada
                  </FormLabel>
                  <Input
                    name="waste_quantity"
                    value={formData.waste_quantity}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='number'
                    step='0.01'
                    placeholder='0.00'
                    size='lg'
                    isDisabled={!formData.supply_entry_id}
                  />
                  {selectedSupply && (
                    <Text fontSize='xs' color='gray.500' mt='5px'>
                      Máximo: {selectedSupply.quantity} {selectedSupply.unit}
                    </Text>
                  )}
                </FormControl>
                <FormControl isRequired>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Motivo del Desperdicio
                  </FormLabel>
                  <Select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    borderRadius='15px'
                    fontSize='sm'
                    size='lg'
                    placeholder='Seleccione un motivo'>
                    <option value="Vencido">Vencido</option>
                    <option value="Dañado">Dañado</option>
                    <option value="Contaminado">Contaminado</option>
                    <option value="Mal estado">Mal estado</option>
                    <option value="Error en preparación">Error en preparación</option>
                    <option value="Otro">Otro</option>
                  </Select>
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
                  placeholder='Detalles adicionales sobre el desperdicio'
                  rows={3}
                />
              </FormControl>

              {selectedSupply && formData.waste_quantity && (
                <Card bg='red.50' p='15px' mb='24px' borderRadius='15px'>
                  <Text fontSize='sm' color='red.600' fontWeight='bold'>
                    Pérdida estimada: Bs. {(parseFloat(formData.waste_quantity) * parseFloat(selectedSupply.unit_price)).toFixed(2)}
                  </Text>
                </Card>
              )}

              <Button
                onClick={handleSubmit}
                isLoading={loading}
                variant='dark'
                fontSize='sm'
                fontWeight='bold'
                w='200px'
                h='45px'
                mb='24px'>
                REGISTRAR DESPERDICIO
              </Button>
            </Flex>
          )}
        </CardBody>
      </Card>

      {/* Tabla de reportes de desperdicios */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Flex justify='space-between' align='center'>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Historial de Desperdicios
            </Text>
            <Badge colorScheme='red' p='6px 12px' borderRadius='8px'>
              {wasteReports.length} reportes
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {wasteReports.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay reportes de desperdicios registrados
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Fecha</Th>
                  <Th borderColor={borderColor} color='gray.400'>Producto</Th>
                  <Th borderColor={borderColor} color='gray.400'>Cantidad</Th>
                  <Th borderColor={borderColor} color='gray.400'>Motivo</Th>
                  <Th borderColor={borderColor} color='gray.400'>Pérdida</Th>
                  <Th borderColor={borderColor} color='gray.400'>Observaciones</Th>
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {wasteReports.map((report) => (
                  <Tr key={report.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{new Date(report.waste_date).toLocaleDateString()}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>{report.product_name}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{report.waste_quantity} {report.unit}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge colorScheme='red'>{report.reason}</Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold' color='red.500'>
                        Bs. {parseFloat(report.loss_amount).toFixed(2)}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{report.notes || 'N/A'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='blue'
                        me='5px'
                        onClick={() => openEditModal(report)}>
                        Editar
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='red'
                        onClick={() => openDeleteDialog(report.id)}>
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

      {/* Modal para editar reporte */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Reporte de Desperdicio</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='16px'>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Insumo</FormLabel>
                <Select
                  name="supply_entry_id"
                  value={editFormData.supply_entry_id || ""}
                  onChange={handleEditChange}
                  size='md'>
                  {supplies.map((supply) => (
                    <option key={supply.id} value={supply.id}>
                      {supply.product_name} - {supply.quantity} {supply.unit}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Fecha</FormLabel>
                <Input
                  name="waste_date"
                  value={editFormData.waste_date || ""}
                  onChange={handleEditChange}
                  type='date'
                  size='md'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='16px'>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Cantidad Desperdiciada</FormLabel>
                <Input
                  name="waste_quantity"
                  value={editFormData.waste_quantity || ""}
                  onChange={handleEditChange}
                  type='number'
                  step='0.01'
                  size='md'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Motivo</FormLabel>
                <Select
                  name="reason"
                  value={editFormData.reason || ""}
                  onChange={handleEditChange}
                  size='md'>
                  <option value="Vencido">Vencido</option>
                  <option value="Dañado">Dañado</option>
                  <option value="Contaminado">Contaminado</option>
                  <option value="Mal estado">Mal estado</option>
                  <option value="Error en preparación">Error en preparación</option>
                  <option value="Otro">Otro</option>
                </Select>
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
              Eliminar Reporte
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

export default WasteReport;
