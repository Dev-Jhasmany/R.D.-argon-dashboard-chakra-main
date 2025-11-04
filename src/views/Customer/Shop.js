import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Image,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  VStack,
  HStack,
  Badge,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon, MinusIcon } from "@chakra-ui/icons";
import { FiShoppingCart } from "react-icons/fi";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import publicApi from "services/publicApi";

function Shop() {
  const textColor = useColorModeValue("gray.700", "white");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headingColor = useColorModeValue("gray.800", "white");
  const subheadingColor = useColorModeValue("gray.600", "gray.300");
  const categoryColor = useColorModeValue("gray.500", "gray.400");
  const descriptionColor = useColorModeValue("gray.600", "gray.400");
  const stockColor = useColorModeValue("gray.500", "gray.400");
  const headerBg = useColorModeValue("linear(to-r, blue.400, blue.600)", "linear(to-r, blue.600, blue.800)");
  const cardHoverShadow = useColorModeValue("xl", "dark-lg");
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadData();
    loadCart();

    // Actualización automática cada 10 segundos
    const intervalId = setInterval(() => {
      loadData(false); // false = no mostrar spinner de carga
    }, 10000); // 10000ms = 10 segundos

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const loadData = async (showLoadingSpinner = true) => {
    // Primero cargar categorías, luego productos
    const cats = await loadCategories();
    await loadProducts(cats, showLoadingSpinner);
  };

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const loadCategories = async () => {
    let loadedCategories = [];
    try {
      // Cargar categorías reales desde el backend usando API pública
      const response = await publicApi.get('/categories');
      const allCategories = response.data;

      // Filtrar solo categorías activas y extraer los nombres
      const activeCategories = allCategories
        .filter((cat) => cat.is_active)
        .map((cat) => cat.name);

      if (activeCategories.length > 0) {
        setCategories(activeCategories);
        loadedCategories = activeCategories;
        console.log(`✅ Categorías cargadas desde backend: ${activeCategories.join(', ')}`);
      }
    } catch (error) {
      // Si el backend requiere autenticación (401), mostrar mensaje informativo
      if (error.response?.status === 401) {
        console.log('ℹ️ Backend requiere configurar acceso público a categorías');
        toast({
          title: "Nota",
          description: "Las categorías se mostrarán cuando configures acceso público al endpoint /categories",
          status: "info",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        console.log('ℹ️ No se pudieron cargar categorías del backend');
      }
      // Si falla, las categorías se extraerán de los productos de ejemplo
    }
    return loadedCategories;
  };

  const loadProducts = async (loadedCategories = [], showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }

    // ========================================================================
    // CARGANDO PRODUCTOS REALES DESDE EL BACKEND
    // ========================================================================
    // Los productos mostrados aquí son los mismos que aparecen en el panel
    // de administración en /admin/list-products
    // ========================================================================

    try {
      console.log('📡 Cargando productos desde backend...');
      const response = await publicApi.get('/products');
      const allProducts = response.data;

      console.log(`✅ Se recibieron ${allProducts.length} productos del backend`);

      // Filtrar solo productos activos y con stock disponible
      // Transformar el objeto category a category_name para compatibilidad con la UI
      const activeProducts = allProducts
        .filter((p) => p.is_active && parseFloat(p.stock) > 0)
        .map((p) => ({
          ...p,
          category_name: p.category?.name || 'Sin categoría'
        }));

      console.log(`✅ Productos activos con stock: ${activeProducts.length}`);
      console.log('📦 Productos cargados:', activeProducts.map(p => `${p.name} (${p.category_name})`));

      setProducts(activeProducts);

      // Actualizar el stock de los productos en el carrito
      updateCartStock(activeProducts);

      // Si no se cargaron categorías del backend antes, extraerlas de los productos
      if (loadedCategories.length === 0) {
        const uniqueCategories = [
          ...new Set(activeProducts.map((p) => p.category_name)),
        ].filter(Boolean);
        setCategories(uniqueCategories);
        console.log('📂 Categorías extraídas de productos:', uniqueCategories);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);

      // Si es error 401, mostrar mensaje específico
      if (error.response?.status === 401) {
        toast({
          title: "Configuración requerida",
          description: "El backend requiere configurar acceso público al endpoint /products. Consulta la documentación.",
          status: "warning",
          duration: 6000,
          isClosable: true,
          position: "top-right",
        });
        console.log('ℹ️ Para habilitar productos reales, configura el backend para permitir acceso público a GET /products');
      } else {
        toast({
          title: "Error al cargar productos",
          description: error.response?.data?.message || "No se pudieron cargar los productos del servidor",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      }

      // En caso de error, dejar la lista vacía
      setProducts([]);
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("customerCart") || "[]");
    setCart(savedCart);
  };

  const updateCartStock = (updatedProducts) => {
    const currentCart = JSON.parse(localStorage.getItem("customerCart") || "[]");

    if (currentCart.length === 0) {
      return; // No hay nada que actualizar
    }

    let cartUpdated = false;
    const updatedCart = currentCart.map((cartItem) => {
      // Buscar el producto actualizado
      const updatedProduct = updatedProducts.find((p) => p.id === cartItem.id);

      if (updatedProduct) {
        const newStock = parseFloat(updatedProduct.stock);
        const oldStock = parseFloat(cartItem.stock);

        // Si el stock cambió, actualizar
        if (newStock !== oldStock) {
          console.log(`📦 Stock actualizado para ${cartItem.name}: ${oldStock} → ${newStock}`);
          cartUpdated = true;

          // Si la cantidad en el carrito excede el nuevo stock, ajustar
          if (cartItem.quantity > newStock) {
            console.log(`⚠️ Cantidad ajustada para ${cartItem.name}: ${cartItem.quantity} → ${newStock}`);
            return {
              ...cartItem,
              stock: newStock,
              quantity: Math.max(0, newStock)
            };
          }

          return {
            ...cartItem,
            stock: newStock
          };
        }
      }

      return cartItem;
    }).filter((item) => item.quantity > 0); // Eliminar items con cantidad 0

    if (cartUpdated) {
      // Actualizar localStorage y estado
      localStorage.setItem("customerCart", JSON.stringify(updatedCart));
      setCart(updatedCart);
      window.dispatchEvent(new Event("cartUpdated"));
      console.log('✅ Carrito actualizado con nuevo stock');
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      // Si seleccionó "Promociones", filtrar productos con promoción activa
      if (selectedCategory === "Promociones") {
        filtered = filtered.filter((p) => p.promotion && p.promotion.is_active);
      } else {
        // Filtrar por categoría normal
        filtered = filtered.filter((p) => p.category_name === selectedCategory);
      }
    }

    setFilteredProducts(filtered);
  };

  const getProductQuantityInCart = (productId) => {
    const item = cart.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  const addToCart = (product) => {
    // Para productos con promoción, usar el ID compuesto para diferenciarlos
    // Para productos sin promoción, usar el ID normal
    const cartItemId = product.id;
    const existingItem = cart.find((i) => i.id === cartItemId);
    let newCart;

    if (existingItem) {
      // Verificar stock
      if (existingItem.quantity >= parseFloat(product.stock)) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${product.stock} unidades disponibles`,
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        return;
      }
      newCart = cart.map((i) =>
        i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      // Usar el precio final (con descuento) si tiene promoción activa, sino el precio normal
      const finalPrice = product.promotion && product.promotion.is_active
        ? parseFloat(product.final_price || product.price)
        : parseFloat(product.price);

      // Nombre del producto con promoción incluida si aplica
      const displayName = product.promotion && product.promotion.is_active
        ? `${product.name} - ${product.promotion.name}`
        : product.name;

      newCart = [
        ...cart,
        {
          id: cartItemId,
          _originalProductId: product._originalProductId || product.id, // Guardar ID original
          name: displayName,
          price: finalPrice,
          original_price: parseFloat(product.price),
          quantity: 1,
          stock: parseFloat(product.stock),
          image: product.image,
          promotion: product.promotion && product.promotion.is_active ? {
            id: product.promotion.id,
            name: product.promotion.name,
            discount_type: product.promotion.discount_type,
            discount_value: product.promotion.discount_value
          } : null,
        },
      ];
    }

    setCart(newCart);
    localStorage.setItem("customerCart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));

    toast({
      title: "Producto agregado",
      description: `${product.name} añadido al carrito`,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top",
    });
  };

  const removeFromCart = (product) => {
    const existingItem = cart.find((i) => i.id === product.id);
    let newCart;

    if (existingItem && existingItem.quantity > 1) {
      newCart = cart.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity - 1 } : i
      );
    } else {
      newCart = cart.filter((i) => i.id !== product.id);
    }

    setCart(newCart);
    localStorage.setItem("customerCart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) {
    return (
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color={textColor}>Cargando productos...</Text>
          </VStack>
        </Center>
      </Flex>
    );
  }

  return (
    <Box pt={{ base: "80px", md: "100px" }} px={{ base: "15px", md: "30px" }} pb="30px" bg="transparent">
      {/* Header */}
      <Box
        mb={8}
        p={6}
        borderRadius="xl"
        bgGradient={headerBg}
        boxShadow="lg"
      >
        <Text
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="extrabold"
          color="white"
          mb={2}
          textShadow="0 2px 10px rgba(0,0,0,0.2)"
          letterSpacing="tight"
        >
          Nuestros Productos
        </Text>
        <Text
          color="whiteAlpha.900"
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="medium"
        >
          Encuentra los mejores productos con entrega rápida
        </Text>
      </Box>

      {/* Filters */}
      <Card mb={6}>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select
              placeholder="Todas las categorías"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Promociones">Promociones</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Center h="300px">
          <VStack spacing={4}>
            <Text color={subheadingColor} fontSize="lg" fontWeight="medium">
              No se encontraron productos
            </Text>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {filteredProducts.map((product) => {
            const quantityInCart = getProductQuantityInCart(product.id);
            return (
              <Card
                key={product.id}
                borderRadius="15px"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: cardHoverShadow,
                }}
                bg={bgColor}
                borderColor={borderColor}
                borderWidth="1px"
              >
                <CardBody p={0}>
                  {/* Product Image */}
                  <Box
                    h="200px"
                    bg={useColorModeValue("gray.100", "gray.700")}
                    position="relative"
                    overflow="hidden"
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                      />
                    ) : (
                      <Flex
                        w="100%"
                        h="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiShoppingCart} w={12} h={12} color="gray.400" />
                      </Flex>
                    )}
                    {/* Badge de promoción */}
                    {product.promotion && product.promotion.is_active && (
                      <Badge
                        position="absolute"
                        top={2}
                        left={2}
                        colorScheme="green"
                        fontSize="sm"
                        px={3}
                        py={1}
                      >
                        PROMOCIÓN
                      </Badge>
                    )}
                    {/* Badge de pocas unidades */}
                    {parseFloat(product.stock) < 10 && (
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="orange"
                      >
                        Pocas unidades
                      </Badge>
                    )}
                  </Box>

                  {/* Product Info */}
                  <Box p={4}>
                    <Text
                      fontSize="sm"
                      color={categoryColor}
                      mb={1}
                      textTransform="uppercase"
                      fontWeight="semibold"
                      letterSpacing="wide"
                    >
                      {product.category_name}
                    </Text>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={headingColor}
                      mb={2}
                      noOfLines={2}
                      minH="50px"
                    >
                      {product.name}
                    </Text>
                    {product.description && (
                      <Text fontSize="sm" color={descriptionColor} mb={3} noOfLines={2}>
                        {product.description}
                      </Text>
                    )}

                    {/* Mostrar información de promoción si existe */}
                    {product.promotion && product.promotion.is_active && (
                      <Box
                        mb={2}
                        p={2}
                        bg={useColorModeValue("green.50", "green.900")}
                        borderRadius="md"
                        borderLeft="3px solid"
                        borderColor="green.500"
                      >
                        <HStack spacing={2}>
                          <Badge colorScheme="green" fontSize="xs">
                            {product.promotion.discount_type === 'percentage'
                              ? `${product.promotion.discount_value}% OFF`
                              : product.promotion.discount_type === 'combo'
                              ? 'COMBO'
                              : `Bs. ${parseFloat(product.promotion.discount_value).toFixed(2)} OFF`
                            }
                          </Badge>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("green.700", "green.200")}
                            fontWeight="semibold"
                            noOfLines={1}
                          >
                            {product.promotion.name}
                          </Text>
                        </HStack>
                        {product.promotion.description && (
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.600", "gray.300")}
                            mt={1}
                            noOfLines={2}
                          >
                            {product.promotion.description}
                          </Text>
                        )}
                      </Box>
                    )}

                    <HStack justify="space-between" mb={3}>
                      <Box>
                        {product.promotion && product.promotion.is_active ? (
                          <VStack align="start" spacing={0}>
                            {product.promotion.discount_type === 'combo' ? (
                              <>
                                <Text fontSize="xs" color="green.700" fontWeight="semibold">
                                  Precio Combo
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                                  Bs. {parseFloat(product.final_price || product.price).toFixed(2)}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Text fontSize="sm" color="gray.500" textDecoration="line-through">
                                  Bs. {parseFloat(product.price).toFixed(2)}
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                                  Bs. {parseFloat(product.final_price || product.price).toFixed(2)}
                                </Text>
                              </>
                            )}
                          </VStack>
                        ) : (
                          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                            Bs. {parseFloat(product.price).toFixed(2)}
                          </Text>
                        )}
                      </Box>
                      <Text fontSize="sm" color={stockColor} fontWeight="medium">
                        Stock: {product.stock}
                      </Text>
                    </HStack>

                    {/* Add to Cart Button */}
                    {quantityInCart === 0 ? (
                      <Button
                        colorScheme="blue"
                        w="100%"
                        leftIcon={<AddIcon />}
                        onClick={() => addToCart(product)}
                        isDisabled={parseFloat(product.stock) === 0}
                      >
                        Agregar
                      </Button>
                    ) : (
                      <HStack w="100%" spacing={2}>
                        <IconButton
                          icon={<MinusIcon />}
                          onClick={() => removeFromCart(product)}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                        />
                        <Flex
                          flex={1}
                          bg={useColorModeValue("blue.50", "blue.900")}
                          py={2}
                          borderRadius="md"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Text
                            fontWeight="bold"
                            color={useColorModeValue("blue.600", "blue.200")}
                          >
                            {quantityInCart} en carrito
                          </Text>
                        </Flex>
                        <IconButton
                          icon={<AddIcon />}
                          onClick={() => addToCart(product)}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          isDisabled={
                            quantityInCart >= parseFloat(product.stock)
                          }
                        />
                      </HStack>
                    )}
                  </Box>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default Shop;
