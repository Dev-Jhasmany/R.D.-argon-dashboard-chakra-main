import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Select,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  Center,
  Spinner,
  Box,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import productService from "services/productService";
import promotionService from "services/promotionService";

function RegisterPromotion() {
  const textColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputTextColor = useColorModeValue("gray.800", "white");
  const productBoxBg = useColorModeValue('blue.50', 'gray.700');
  const productBoxBorder = useColorModeValue('blue.200', 'gray.600');
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingDiscount, setSubmittingDiscount] = useState(false);
  const [submittingCombo, setSubmittingCombo] = useState(false);

  // Formulario de descuento
  const [discountFormData, setDiscountFormData] = useState({
    name: "",
    product_id: "",
    discount_percentage: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  // Formulario de combo
  const [comboFormData, setComboFormData] = useState({
    name: "",
    product_count: "",
    product_ids: [],
    combo_price: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const result = await productService.getAllProducts();
    if (result.success) {
      const activeProducts = result.data.filter((p) => p.is_active);
      setProducts(activeProducts);
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

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setDiscountFormData({
      ...discountFormData,
      [name]: value,
    });
  };

  const handleComboChange = (e) => {
    const { name, value } = e.target;

    // Si cambia la cantidad de productos, reiniciar el array de product_ids
    if (name === "product_count") {
      const count = parseInt(value) || 0;
      setComboFormData({
        ...comboFormData,
        [name]: value,
        product_ids: Array(count).fill(""),
      });
    } else {
      setComboFormData({
        ...comboFormData,
        [name]: value,
      });
    }
  };

  const handleComboProductChange = (index, productId) => {
    const newProductIds = [...comboFormData.product_ids];
    newProductIds[index] = productId;
    setComboFormData({
      ...comboFormData,
      product_ids: newProductIds,
    });
  };

  const handleDiscountSubmit = async () => {
    // Validación de productos
    if (products.length === 0) {
      toast({
        title: "Error",
        description: "No hay productos registrados. Debe registrar productos antes de crear promociones.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validación de campos requeridos
    if (!discountFormData.name || !discountFormData.product_id || !discountFormData.discount_percentage || !discountFormData.start_date || !discountFormData.end_date) {
      toast({
        title: "Campos incompletos",
        description: "Por favor complete todos los campos requeridos",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validación de porcentaje
    const percentage = parseFloat(discountFormData.discount_percentage);
    if (percentage <= 0 || percentage > 100) {
      toast({
        title: "Porcentaje inválido",
        description: "El porcentaje de descuento debe estar entre 1 y 100",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validación de fechas
    if (new Date(discountFormData.end_date) <= new Date(discountFormData.start_date)) {
      toast({
        title: "Fechas inválidas",
        description: "La fecha de fin debe ser posterior a la fecha de inicio",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmittingDiscount(true);

    const promotionData = {
      ...discountFormData,
      promotion_type: "discount",
      discount_percentage: parseFloat(discountFormData.discount_percentage),
    };

    const result = await promotionService.createPromotion(promotionData);

    if (result.success) {
      toast({
        title: "Promoción registrada",
        description: "La promoción de descuento ha sido registrada exitosamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Limpiar formulario
      setDiscountFormData({
        name: "",
        product_id: "",
        discount_percentage: "",
        start_date: "",
        end_date: "",
        description: "",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    setSubmittingDiscount(false);
  };

  const handleComboSubmit = async () => {
    // Validación de productos
    if (products.length === 0) {
      toast({
        title: "Error",
        description: "No hay productos registrados. Debe registrar productos antes de crear promociones.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validación de campos requeridos
    if (!comboFormData.name || !comboFormData.product_count || !comboFormData.combo_price || !comboFormData.start_date || !comboFormData.end_date) {
      toast({
        title: "Campos incompletos",
        description: "Por favor complete todos los campos requeridos",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validación de productos seleccionados
    const validProducts = comboFormData.product_ids.filter(id => id !== "");
    if (validProducts.length === 0) {
      toast({
        title: "Sin productos",
        description: "Debe seleccionar al menos un producto para el combo",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (validProducts.length !== parseInt(comboFormData.product_count)) {
      toast({
        title: "Productos incompletos",
        description: `Debe seleccionar ${comboFormData.product_count} productos para el combo`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validación de precio
    const price = parseFloat(comboFormData.combo_price);
    if (price <= 0) {
      toast({
        title: "Precio inválido",
        description: "El precio del combo debe ser mayor a 0",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validación de fechas
    if (new Date(comboFormData.end_date) <= new Date(comboFormData.start_date)) {
      toast({
        title: "Fechas inválidas",
        description: "La fecha de fin debe ser posterior a la fecha de inicio",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmittingCombo(true);

    // Crear lista de nombres de productos
    const productNames = validProducts.map(productId => {
      const product = products.find(p => p.id === productId);
      return product ? product.name : '';
    }).filter(name => name !== '').join(', ');

    // Nota: Por ahora enviamos solo el primer producto al backend
    // En el futuro se puede extender el backend para soportar múltiples productos
    const promotionData = {
      name: comboFormData.name,
      product_id: validProducts[0], // Por ahora solo el primero
      promotion_type: "combo",
      combo_price: parseFloat(comboFormData.combo_price),
      start_date: comboFormData.start_date,
      end_date: comboFormData.end_date,
      description: (comboFormData.description || '') + `\nProductos del combo: ${productNames}`,
    };

    console.log('Enviando promoción combo:', promotionData);
    const result = await promotionService.createPromotion(promotionData);

    if (result.success) {
      toast({
        title: "Promoción registrada",
        description: "La promoción por combo ha sido registrada exitosamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Limpiar formulario
      setComboFormData({
        name: "",
        product_count: "",
        product_ids: [],
        combo_price: "",
        start_date: "",
        end_date: "",
        description: "",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    setSubmittingCombo(false);
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
    <Flex direction='column' pt={{ base: "120px", md: "75px" }} gap='22px'>
      {products.length === 0 ? (
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
          <CardBody>
            <Center h="200px">
              <Flex direction='column' align='center'>
                <Text fontSize="lg" color="red.500" mb={3}>
                  ⚠️ No hay productos registrados
                </Text>
                <Text fontSize="md" color="gray.500">
                  Debe registrar al menos un producto antes de crear promociones
                </Text>
              </Flex>
            </Center>
          </CardBody>
        </Card>
      ) : (
        <Grid templateColumns={{ sm: '1fr', lg: 'repeat(2, 1fr)' }} gap='22px'>
          {/* Formulario de Reducción de Precios */}
          <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
            <CardHeader p='6px 0px 22px 0px'>
              <Text fontSize='xl' color={textColor} fontWeight='bold'>
                Registrar Promociones de Reducción de Precios
              </Text>
            </CardHeader>
            <CardBody>
              <Flex direction='column' w='100%'>
                <FormControl isRequired mb='20px'>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Nombre de la Promoción
                  </FormLabel>
                  <Input
                    name="name"
                    value={discountFormData.name}
                    onChange={handleDiscountChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='text'
                    placeholder='Ej: Descuento de Verano'
                    size='lg'
                    bg={inputBg}
                    color={inputTextColor}
                  />
                </FormControl>
                <FormControl isRequired mb='20px'>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Producto
                  </FormLabel>
                  <Select
                    name="product_id"
                    value={discountFormData.product_id}
                    onChange={handleDiscountChange}
                    borderRadius='15px'
                    fontSize='sm'
                    size='lg'
                    placeholder='Seleccione un producto'
                    bg={inputBg}
                    color={inputTextColor}>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.code} - {product.name} (Bs. {product.price})
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired mb='20px'>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Porcentaje de Descuento
                  </FormLabel>
                  <Input
                    name="discount_percentage"
                    value={discountFormData.discount_percentage}
                    onChange={handleDiscountChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='number'
                    placeholder='0 - 100'
                    min='1'
                    max='100'
                    step='0.01'
                    size='lg'
                    bg={inputBg}
                    color={inputTextColor}
                  />
                </FormControl>
                <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='20px'>
                  <FormControl isRequired>
                    <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                      Fecha de Inicio
                    </FormLabel>
                    <Input
                      name="start_date"
                      value={discountFormData.start_date}
                      onChange={handleDiscountChange}
                      borderRadius='15px'
                      fontSize='sm'
                      type='date'
                      size='lg'
                      bg={inputBg}
                      color={inputTextColor}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                      Fecha de Fin
                    </FormLabel>
                    <Input
                      name="end_date"
                      value={discountFormData.end_date}
                      onChange={handleDiscountChange}
                      borderRadius='15px'
                      fontSize='sm'
                      type='date'
                      size='lg'
                      bg={inputBg}
                      color={inputTextColor}
                    />
                  </FormControl>
                </Grid>
                <FormControl mb='24px'>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Descripción
                  </FormLabel>
                  <Textarea
                    name="description"
                    value={discountFormData.description}
                    onChange={handleDiscountChange}
                    borderRadius='15px'
                    fontSize='sm'
                    placeholder='Descripción de la promoción'
                    rows={3}
                    bg={inputBg}
                    color={inputTextColor}
                  />
                </FormControl>
                <Button
                  onClick={handleDiscountSubmit}
                  isLoading={submittingDiscount}
                  variant='dark'
                  fontSize='sm'
                  fontWeight='bold'
                  w='full'
                  h='45px'
                  mb='24px'>
                  REGISTRAR PROMOCIÓN
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {/* Formulario de Promoción por Combos */}
          <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
            <CardHeader p='6px 0px 22px 0px'>
              <Text fontSize='xl' color={textColor} fontWeight='bold'>
                Registrar Promociones por Combos
              </Text>
            </CardHeader>
            <CardBody>
              <Flex direction='column' w='100%'>
                <FormControl isRequired mb='20px'>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Nombre del Combo
                  </FormLabel>
                  <Input
                    name="name"
                    value={comboFormData.name}
                    onChange={handleComboChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='text'
                    placeholder='Ej: Combo Familiar'
                    size='lg'
                    bg={inputBg}
                    color={inputTextColor}
                  />
                </FormControl>
                <FormControl isRequired mb='20px'>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Cantidad de Productos
                  </FormLabel>
                  <Select
                    name="product_count"
                    value={comboFormData.product_count}
                    onChange={handleComboChange}
                    borderRadius='15px'
                    fontSize='sm'
                    size='lg'
                    placeholder='Seleccione cantidad'
                    bg={inputBg}
                    color={inputTextColor}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Producto' : 'Productos'}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Campos dinámicos de productos */}
                {comboFormData.product_count && parseInt(comboFormData.product_count) > 0 && (
                  <Box mb='20px' p={4} borderRadius='15px' bg={productBoxBg} border='1px' borderColor={productBoxBorder}>
                    <Text fontSize='sm' fontWeight='bold' mb={3} color={textColor}>
                      Seleccione los {comboFormData.product_count} productos del combo:
                    </Text>
                    {comboFormData.product_ids.map((productId, index) => (
                      <FormControl key={index} mb={index < comboFormData.product_ids.length - 1 ? '15px' : '0'}>
                        <FormLabel ms='4px' fontSize='xs' fontWeight='normal'>
                          Producto {index + 1}
                        </FormLabel>
                        <Select
                          value={productId}
                          onChange={(e) => handleComboProductChange(index, e.target.value)}
                          borderRadius='10px'
                          fontSize='sm'
                          size='md'
                          placeholder='Seleccione un producto'
                          bg={inputBg}
                          color={inputTextColor}>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.code} - {product.name} (Bs. {product.price})
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    ))}
                  </Box>
                )}

                <FormControl isRequired mb='20px'>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Precio del Combo (Bs.)
                  </FormLabel>
                  <Input
                    name="combo_price"
                    value={comboFormData.combo_price}
                    onChange={handleComboChange}
                    borderRadius='15px'
                    fontSize='sm'
                    type='number'
                    placeholder='0.00'
                    min='0.01'
                    step='0.01'
                    size='lg'
                    bg={inputBg}
                    color={inputTextColor}
                  />
                </FormControl>
                <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='20px'>
                  <FormControl isRequired>
                    <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                      Fecha de Inicio
                    </FormLabel>
                    <Input
                      name="start_date"
                      value={comboFormData.start_date}
                      onChange={handleComboChange}
                      borderRadius='15px'
                      fontSize='sm'
                      type='date'
                      size='lg'
                      bg={inputBg}
                      color={inputTextColor}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                      Fecha de Fin
                    </FormLabel>
                    <Input
                      name="end_date"
                      value={comboFormData.end_date}
                      onChange={handleComboChange}
                      borderRadius='15px'
                      fontSize='sm'
                      type='date'
                      size='lg'
                      bg={inputBg}
                      color={inputTextColor}
                    />
                  </FormControl>
                </Grid>
                <FormControl mb='24px'>
                  <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                    Descripción
                  </FormLabel>
                  <Textarea
                    name="description"
                    value={comboFormData.description}
                    onChange={handleComboChange}
                    borderRadius='15px'
                    fontSize='sm'
                    placeholder='Descripción de la promoción'
                    rows={3}
                    bg={inputBg}
                    color={inputTextColor}
                  />
                </FormControl>
                <Button
                  onClick={handleComboSubmit}
                  isLoading={submittingCombo}
                  variant='dark'
                  fontSize='sm'
                  fontWeight='bold'
                  w='full'
                  h='45px'
                  mb='24px'>
                  REGISTRAR PROMOCIÓN COMBO
                </Button>
              </Flex>
            </CardBody>
          </Card>
        </Grid>
      )}
    </Flex>
  );
}

export default RegisterPromotion;
