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
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import productService from "services/productService";

function ListProducts() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const cancelRef = React.useRef();

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
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
      });
      loadProducts();
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

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Agotado", color: "red" };
    if (stock < 10) return { label: "Bajo Stock", color: "orange" };
    return { label: "Disponible", color: "green" };
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
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Lista de Productos
          </Text>
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
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
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
                      <Td borderColor={borderColor}>
                        <Button size='sm' variant='outline' colorScheme='blue' me='5px'>
                          Editar
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          colorScheme='red'
                          onClick={() => openDeleteDialog(product.id)}
                        >
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
    </Flex>
  );
}

export default ListProducts;
