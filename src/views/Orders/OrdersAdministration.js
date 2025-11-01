import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Badge,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputRightAddon,
  IconButton,
} from "@chakra-ui/react";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import productService from "services/productService";
import promotionService from "services/promotionService";
import orderService from "services/orderService";

function OrdersAdministration() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [preparationTimes, setPreparationTimes] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [productsResult, promotionsResult] = await Promise.all([
      productService.getAllProducts(),
      promotionService.getAllPromotions(),
    ]);

    if (productsResult.success) {
      setProducts(productsResult.data);
      // Inicializar tiempos de preparación
      const times = {};
      productsResult.data.forEach((p) => {
        times[`product-${p.id}`] = p.preparationTime || 5;
      });
      setPreparationTimes((prev) => ({ ...prev, ...times }));
    }

    if (promotionsResult.success) {
      setPromotions(promotionsResult.data);
      // Inicializar tiempos de preparación
      const times = {};
      promotionsResult.data.forEach((p) => {
        times[`promotion-${p.id}`] = p.preparationTime || 10;
      });
      setPreparationTimes((prev) => ({ ...prev, ...times }));
    }

    setLoading(false);
  };

  const handleTimeChange = (type, id, value) => {
    const key = `${type}-${id}`;
    setPreparationTimes((prev) => ({
      ...prev,
      [key]: parseInt(value) || 0,
    }));
  };

  const handleSaveProduct = async (productId) => {
    const time = preparationTimes[`product-${productId}`];

    if (!time || time < 1) {
      toast({
        title: "Tiempo inválido",
        description: "El tiempo de preparación debe ser al menos 1 minuto",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await orderService.updatePreparationTime(
      'product',
      productId,
      time
    );

    if (result.success) {
      toast({
        title: "Tiempo actualizado",
        description: "El tiempo de preparación ha sido actualizado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditingProduct(null);
      loadData();
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

  const handleSavePromotion = async (promotionId) => {
    const time = preparationTimes[`promotion-${promotionId}`];

    if (!time || time < 1) {
      toast({
        title: "Tiempo inválido",
        description: "El tiempo de preparación debe ser al menos 1 minuto",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await orderService.updatePreparationTime(
      'promotion',
      promotionId,
      time
    );

    if (result.success) {
      toast({
        title: "Tiempo actualizado",
        description: "El tiempo de preparación ha sido actualizado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditingPromotion(null);
      loadData();
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
      <Card>
        <CardHeader p='6px 0px 22px 0px'>
          <Box>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Administración de Tiempos de Preparación
            </Text>
            <Text fontSize='sm' color='gray.500' mt={1}>
              Configure el tiempo estimado de preparación para cada producto y promoción
            </Text>
          </Box>
        </CardHeader>
        <CardBody>
          <Tabs colorScheme="teal" variant="enclosed">
            <TabList>
              <Tab>
                Productos ({products.length})
              </Tab>
              <Tab>
                Promociones ({promotions.length})
              </Tab>
            </TabList>

            <TabPanels>
              {/* Panel de Productos */}
              <TabPanel>
                <Table variant='simple' color={textColor}>
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor}>Código</Th>
                      <Th borderColor={borderColor}>Nombre</Th>
                      <Th borderColor={borderColor}>Categoría</Th>
                      <Th borderColor={borderColor}>Estado</Th>
                      <Th borderColor={borderColor}>Tiempo de Preparación</Th>
                      <Th borderColor={borderColor}>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {products.map((product) => {
                      const isEditing = editingProduct === product.id;
                      const timeKey = `product-${product.id}`;

                      return (
                        <Tr key={product.id}>
                          <Td borderColor={borderColor}>
                            <Badge colorScheme="purple">{product.code}</Badge>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text fontSize="sm" fontWeight="bold">
                              {product.name}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text fontSize="sm">
                              {product.category?.name || 'Sin categoría'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Badge colorScheme={product.is_active ? 'green' : 'red'}>
                              {product.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor}>
                            {isEditing ? (
                              <InputGroup size="sm" maxW="150px">
                                <Input
                                  type="number"
                                  min="1"
                                  value={preparationTimes[timeKey] || ''}
                                  onChange={(e) =>
                                    handleTimeChange('product', product.id, e.target.value)
                                  }
                                />
                                <InputRightAddon>min</InputRightAddon>
                              </InputGroup>
                            ) : (
                              <Badge colorScheme="teal" fontSize="md" p={2}>
                                {product.preparationTime || 5} minutos
                              </Badge>
                            )}
                          </Td>
                          <Td borderColor={borderColor}>
                            {isEditing ? (
                              <HStack spacing={2}>
                                <IconButton
                                  size="sm"
                                  icon={<CheckIcon />}
                                  colorScheme="green"
                                  onClick={() => handleSaveProduct(product.id)}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingProduct(null);
                                    loadData();
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </HStack>
                            ) : (
                              <IconButton
                                size="sm"
                                icon={<EditIcon />}
                                colorScheme="blue"
                                variant="outline"
                                onClick={() => setEditingProduct(product.id)}
                              />
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TabPanel>

              {/* Panel de Promociones */}
              <TabPanel>
                <Table variant='simple' color={textColor}>
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor}>Nombre</Th>
                      <Th borderColor={borderColor}>Tipo</Th>
                      <Th borderColor={borderColor}>Producto</Th>
                      <Th borderColor={borderColor}>Estado</Th>
                      <Th borderColor={borderColor}>Tiempo de Preparación</Th>
                      <Th borderColor={borderColor}>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {promotions.map((promotion) => {
                      const isEditing = editingPromotion === promotion.id;
                      const timeKey = `promotion-${promotion.id}`;

                      return (
                        <Tr key={promotion.id}>
                          <Td borderColor={borderColor}>
                            <Text fontSize="sm" fontWeight="bold">
                              {promotion.name}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Badge colorScheme="orange">
                              {promotion.promotion_type === 'discount' ? 'Descuento' : 'Combo'}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text fontSize="sm">
                              {promotion.product?.name || 'N/A'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Badge colorScheme={promotion.is_active ? 'green' : 'red'}>
                              {promotion.is_active ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor}>
                            {isEditing ? (
                              <InputGroup size="sm" maxW="150px">
                                <Input
                                  type="number"
                                  min="1"
                                  value={preparationTimes[timeKey] || ''}
                                  onChange={(e) =>
                                    handleTimeChange('promotion', promotion.id, e.target.value)
                                  }
                                />
                                <InputRightAddon>min</InputRightAddon>
                              </InputGroup>
                            ) : (
                              <Badge colorScheme="purple" fontSize="md" p={2}>
                                {promotion.preparationTime || 10} minutos
                              </Badge>
                            )}
                          </Td>
                          <Td borderColor={borderColor}>
                            {isEditing ? (
                              <HStack spacing={2}>
                                <IconButton
                                  size="sm"
                                  icon={<CheckIcon />}
                                  colorScheme="green"
                                  onClick={() => handleSavePromotion(promotion.id)}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingPromotion(null);
                                    loadData();
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </HStack>
                            ) : (
                              <IconButton
                                size="sm"
                                icon={<EditIcon />}
                                colorScheme="blue"
                                variant="outline"
                                onClick={() => setEditingPromotion(promotion.id)}
                              />
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default OrdersAdministration;
