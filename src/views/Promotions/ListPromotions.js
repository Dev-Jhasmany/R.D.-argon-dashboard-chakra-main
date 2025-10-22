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
  Center,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
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
  Textarea,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import promotionService from "services/promotionService";
import productService from "services/productService";

function ListPromotions() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const cancelRef = React.useRef();

  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    promotion_type: "discount",
    discount_percentage: "",
    combo_price: "",
    start_date: "",
    end_date: "",
    product_id: "",
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    const result = await promotionService.getAllPromotions();
    if (result.success) {
      setPromotions(result.data);
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

  const loadProducts = async () => {
    setLoadingProducts(true);
    const result = await productService.getAllProducts();
    if (result.success) {
      setProducts(result.data);
    } else {
      toast({
        title: "Error",
        description: "Error al cargar productos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoadingProducts(false);
  };

  const handleEditClick = async (promotion) => {
    setEditingPromotion(promotion);

    // Cargar productos si no están cargados
    if (products.length === 0) {
      await loadProducts();
    }

    // Formatear fechas para el input type="date"
    const formatDateForInput = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setEditFormData({
      name: promotion.name || "",
      description: promotion.description || "",
      promotion_type: promotion.promotion_type || "discount",
      discount_percentage: promotion.discount_percentage || "",
      combo_price: promotion.combo_price || "",
      start_date: formatDateForInput(promotion.start_date),
      end_date: formatDateForInput(promotion.end_date),
      product_id: promotion.product?.id || "",
    });

    onEditOpen();
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async () => {
    // Validaciones
    if (!editFormData.name || !editFormData.start_date || !editFormData.end_date) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (editFormData.promotion_type === 'discount' && !editFormData.discount_percentage) {
      toast({
        title: "Error",
        description: "Debe especificar el porcentaje de descuento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (editFormData.promotion_type === 'combo' && !editFormData.combo_price) {
      toast({
        title: "Error",
        description: "Debe especificar el precio del combo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Preparar datos para enviar
    const updateData = {
      name: editFormData.name,
      description: editFormData.description,
      promotion_type: editFormData.promotion_type,
      start_date: editFormData.start_date,
      end_date: editFormData.end_date,
      ...(editFormData.product_id && { product_id: editFormData.product_id }),
      ...(editFormData.promotion_type === 'discount' && {
        discount_percentage: parseFloat(editFormData.discount_percentage)
      }),
      ...(editFormData.promotion_type === 'combo' && {
        combo_price: parseFloat(editFormData.combo_price)
      }),
    };

    const result = await promotionService.updatePromotion(editingPromotion.id, updateData);

    if (result.success) {
      toast({
        title: "Promoción actualizada",
        description: "La promoción ha sido actualizada exitosamente",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onEditClose();
      loadPromotions();
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

  const handleToggleActive = async (id) => {
    const result = await promotionService.toggleActivePromotion(id);
    if (result.success) {
      toast({
        title: "Estado actualizado",
        description: "El estado de la promoción ha sido actualizado",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      loadPromotions();
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

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    const result = await promotionService.deletePromotion(deletingId);
    if (result.success) {
      toast({
        title: "Promoción eliminada",
        description: "La promoción ha sido eliminada exitosamente",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      loadPromotions();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    onDeleteClose();
    setDeletingId(null);
  };

  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    if (!promotion.is_active) {
      return { label: "Inactiva", color: "gray" };
    }

    if (now < startDate) {
      return { label: "Programada", color: "blue" };
    }

    if (now >= startDate && now <= endDate) {
      return { label: "Activa", color: "green" };
    }

    return { label: "Finalizada", color: "orange" };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getPromotionValue = (promotion) => {
    if (promotion.promotion_type === 'discount') {
      return `${promotion.discount_percentage}%`;
    } else if (promotion.promotion_type === 'combo') {
      return `Bs. ${parseFloat(promotion.combo_price).toFixed(2)}`;
    }
    return '-';
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
              Lista de Promociones
            </Text>
            <Button
              onClick={loadPromotions}
              variant='outline'
              colorScheme='teal'
              size='sm'>
              Actualizar
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          {promotions.length === 0 ? (
            <Center h="200px">
              <Text fontSize="md" color="gray.500">
                No hay promociones registradas
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Promoción</Th>
                  <Th borderColor={borderColor} color='gray.400'>Tipo</Th>
                  <Th borderColor={borderColor} color='gray.400'>Producto</Th>
                  <Th borderColor={borderColor} color='gray.400'>Valor</Th>
                  <Th borderColor={borderColor} color='gray.400'>Fecha Inicio</Th>
                  <Th borderColor={borderColor} color='gray.400'>Fecha Fin</Th>
                  <Th borderColor={borderColor} color='gray.400'>Estado</Th>
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {promotions.map((promo) => {
                  const status = getPromotionStatus(promo);
                  return (
                    <Tr key={promo.id}>
                      <Td borderColor={borderColor}>
                        <Text fontSize='sm' fontWeight='bold'>{promo.name}</Text>
                        {promo.description && (
                          <Text fontSize='xs' color='gray.500' mt={1}>
                            {promo.description}
                          </Text>
                        )}
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge
                          colorScheme={promo.promotion_type === 'discount' ? 'purple' : 'cyan'}
                          fontSize='xs'
                          p='2px 8px'
                          borderRadius='6px'>
                          {promo.promotion_type === 'discount' ? 'Descuento' : 'Combo'}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize='sm'>
                          {promo.product?.name || '-'}
                        </Text>
                        <Text fontSize='xs' color='gray.500'>
                          {promo.product?.code || '-'}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize='sm' fontWeight='bold' color='green.400'>
                          {getPromotionValue(promo)}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize='sm'>{formatDate(promo.start_date)}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize='sm'>{formatDate(promo.end_date)}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge
                          colorScheme={status.color}
                          fontSize='sm'
                          p='3px 10px'
                          borderRadius='8px'>
                          {status.label}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Flex gap={2} flexWrap="wrap">
                          <Button
                            size='sm'
                            colorScheme='blue'
                            variant='outline'
                            onClick={() => handleEditClick(promo)}>
                            Editar
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            colorScheme={promo.is_active ? 'orange' : 'green'}
                            onClick={() => handleToggleActive(promo.id)}>
                            {promo.is_active ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            colorScheme='red'
                            onClick={() => handleDeleteClick(promo.id)}>
                            Eliminar
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal de Edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Promoción</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Nombre de la Promoción</FormLabel>
              <Input
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                placeholder="Ej: Descuento de verano"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                placeholder="Descripción de la promoción"
                rows={3}
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Tipo de Promoción</FormLabel>
              <Select
                name="promotion_type"
                value={editFormData.promotion_type}
                onChange={handleEditFormChange}
              >
                <option value="discount">Descuento</option>
                <option value="combo">Combo</option>
              </Select>
            </FormControl>

            {editFormData.promotion_type === 'discount' && (
              <FormControl mb={4} isRequired>
                <FormLabel>Porcentaje de Descuento (%)</FormLabel>
                <Input
                  type="number"
                  name="discount_percentage"
                  value={editFormData.discount_percentage}
                  onChange={handleEditFormChange}
                  placeholder="Ej: 15"
                  min="0"
                  max="100"
                />
              </FormControl>
            )}

            {editFormData.promotion_type === 'combo' && (
              <FormControl mb={4} isRequired>
                <FormLabel>Precio del Combo (Bs.)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  name="combo_price"
                  value={editFormData.combo_price}
                  onChange={handleEditFormChange}
                  placeholder="Ej: 25.50"
                  min="0"
                />
              </FormControl>
            )}

            <FormControl mb={4}>
              <FormLabel>Producto</FormLabel>
              <Select
                name="product_id"
                value={editFormData.product_id}
                onChange={handleEditFormChange}
                isDisabled={loadingProducts}
              >
                <option value="">Seleccione un producto (opcional)</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.code}
                  </option>
                ))}
              </Select>
            </FormControl>

            <Flex gap={4}>
              <FormControl isRequired>
                <FormLabel>Fecha de Inicio</FormLabel>
                <Input
                  type="date"
                  name="start_date"
                  value={editFormData.start_date}
                  onChange={handleEditFormChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Fecha de Fin</FormLabel>
                <Input
                  type="date"
                  name="end_date"
                  value={editFormData.end_date}
                  onChange={handleEditFormChange}
                />
              </FormControl>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditSubmit}>
              Guardar Cambios
            </Button>
            <Button onClick={onEditClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alert Dialog para confirmar eliminación */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Eliminar Promoción
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Está seguro de eliminar esta promoción? Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme='red' onClick={handleDeleteConfirm} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
}

export default ListPromotions;
