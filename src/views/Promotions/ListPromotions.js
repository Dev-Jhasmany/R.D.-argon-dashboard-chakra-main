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
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import promotionService from "services/promotionService";

function ListPromotions() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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
    onOpen();
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
    onClose();
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
                        <Button
                          size='sm'
                          variant='outline'
                          colorScheme={promo.is_active ? 'orange' : 'green'}
                          me='5px'
                          mb={{ base: '5px', md: '0' }}
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
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Eliminar Promoción
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Está seguro de eliminar esta promoción? Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
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
