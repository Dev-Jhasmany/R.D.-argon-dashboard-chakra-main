// Chakra imports
import {
  Box,
  Button,
  Flex,
  Grid,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Badge,
  Avatar,
  Icon,
  Tooltip,
  Heading,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import IconBox from "components/Icons/IconBox";
// Custom icons
import {
  CartIcon,
  DocumentIcon,
  GlobeIcon,
  WalletIcon,
  RocketIcon,
} from "components/Icons/Icons.js";
import React, { useState, useEffect } from "react";
import { getDashboardStats, getTopProducts, getLowStockProducts, getRecentActivity } from "services/dashboardService";
import { FiTrendingUp, FiTrendingDown, FiAlertTriangle } from "react-icons/fi";

export default function Dashboard() {
  // Chakra Color Mode
  const iconBlue = useColorModeValue("blue.500", "blue.500");
  const iconGreen = useColorModeValue("green.500", "green.500");
  const iconOrange = useColorModeValue("orange.500", "orange.500");
  const iconPurple = useColorModeValue("purple.500", "purple.500");
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  const tableRowColor = useColorModeValue("#F7FAFC", "navy.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textTableColor = useColorModeValue("gray.500", "white");
  const bgCard = useColorModeValue("white", "navy.800");
  const shadowCard = useColorModeValue("0px 3.5px 5.5px rgba(0, 0, 0, 0.02)", "none");

  const { colorMode } = useColorMode();

  // Estados
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas generales
      const statsData = await getDashboardStats();
      setStats(statsData);

      // Cargar productos más vendidos
      const productsData = await getTopProducts(5);
      setTopProducts(productsData);

      // Cargar productos con bajo stock
      const stockData = await getLowStockProducts(10);
      setLowStock(stockData);

      // Cargar actividad reciente
      const activityData = await getRecentActivity(10);
      setRecentActivity(activityData);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      // Datos de fallback para modo demo
      setStats({
        todaySales: 53897.50,
        salesChange: 3.48,
        todayOrders: 342,
        ordersChange: 5.2,
        newCustomers: 28,
        customersChange: -2.82,
        totalRevenue: 173000,
        revenueChange: 8.12
      });
      setTopProducts([
        { id: 1, name: 'Producto A', sales: 1250, revenue: 45890 },
        { id: 2, name: 'Producto B', sales: 980, revenue: 38450 },
        { id: 3, name: 'Producto C', sales: 856, revenue: 32100 },
        { id: 4, name: 'Producto D', sales: 742, revenue: 28900 },
        { id: 5, name: 'Producto E', sales: 689, revenue: 24700 }
      ]);
      setLowStock([
        { id: 1, name: 'Producto X', stock: 5, minStock: 20 },
        { id: 2, name: 'Producto Y', stock: 8, minStock: 15 },
        { id: 3, name: 'Producto Z', stock: 3, minStock: 10 }
      ]);
      setRecentActivity([
        { id: 1, action: 'Venta registrada', user: 'Juan Pérez', amount: 450, time: 'Hace 5 min' },
        { id: 2, action: 'Producto actualizado', user: 'María García', time: 'Hace 12 min' },
        { id: 3, action: 'Nuevo cliente', user: 'Pedro López', time: 'Hace 18 min' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const StatCard = ({ label, value, change, icon, iconBg, isLoading }) => (
    <Card
      minH='140px'
      bg={bgCard}
      boxShadow={shadowCard}
      borderRadius="15px"
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "0px 20px 30px rgba(0, 0, 0, 0.1)"
      }}
    >
      {isLoading ? (
        <Box p="20px">
          <Skeleton height="20px" mb="10px" />
          <Skeleton height="30px" mb="10px" />
          <SkeletonText noOfLines={1} />
        </Box>
      ) : (
        <Flex direction='column' h="100%">
          <Flex
            flexDirection='row'
            align='center'
            justify='space-between'
            w='100%'
            mb='20px'>
            <Stat>
              <StatLabel
                fontSize='sm'
                color='gray.400'
                fontWeight='bold'
                textTransform='uppercase'
                letterSpacing="wide">
                {label}
              </StatLabel>
              <Flex align="center" mt="2">
                <StatNumber fontSize='2xl' color={textColor} fontWeight='bold'>
                  {value}
                </StatNumber>
              </Flex>
            </Stat>
            <IconBox
              borderRadius='50%'
              as='div'
              h={"50px"}
              w={"50px"}
              bg={iconBg}
              boxShadow="0px 5px 14px rgba(0, 0, 0, 0.08)">
              {icon}
            </IconBox>
          </Flex>
          <Flex align="center">
            <Flex align="center" color={change >= 0 ? 'green.400' : 'red.400'}>
              <Icon
                as={change >= 0 ? FiTrendingUp : FiTrendingDown}
                mr="5px"
                fontSize="sm"
              />
              <Text fontWeight='bold' fontSize='sm'>
                {Math.abs(change).toFixed(2)}%
              </Text>
            </Flex>
            <Text color='gray.400' fontSize='sm' ml="8px">
              vs mes anterior
            </Text>
          </Flex>
        </Flex>
      )}
    </Card>
  );

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      {/* Título del Dashboard */}
      <Heading
        mb="20px"
        fontSize="2xl"
        color={textColor}
        fontWeight="bold"
      >
        Panel de Control
      </Heading>

      {/* Estadísticas principales */}
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px' mb='20px'>
        <StatCard
          label="Ventas de Hoy"
          value={stats ? formatCurrency(stats.todaySales) : '-'}
          change={stats?.salesChange || 0}
          icon={<WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
          iconBg={iconBlue}
          isLoading={loading}
        />
        <StatCard
          label="Pedidos del Día"
          value={stats ? stats.todayOrders : '-'}
          change={stats?.ordersChange || 0}
          icon={<CartIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
          iconBg={iconGreen}
          isLoading={loading}
        />
        <StatCard
          label="Nuevos Clientes"
          value={stats ? stats.newCustomers : '-'}
          change={stats?.customersChange || 0}
          icon={<GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
          iconBg={iconOrange}
          isLoading={loading}
        />
        <StatCard
          label="Ingresos Totales"
          value={stats ? formatCurrency(stats.totalRevenue) : '-'}
          change={stats?.revenueChange || 0}
          icon={<RocketIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
          iconBg={iconPurple}
          isLoading={loading}
        />
      </SimpleGrid>

      {/* Gráficos y tablas */}
      <Grid
        templateColumns={{ sm: "1fr", lg: "1.5fr 1fr" }}
        templateRows={{ lg: "repeat(2, auto)" }}
        gap='20px'>

        {/* Productos más vendidos */}
        <Card
          p='22px'
          bg={bgCard}
          borderRadius="15px"
          boxShadow={shadowCard}
        >
          <Flex direction='column'>
            <Flex align='center' justify='space-between' mb='20px'>
              <Box>
                <Text fontSize='lg' color={textColor} fontWeight='bold'>
                  Productos Más Vendidos
                </Text>
                <Text fontSize='sm' color='gray.400' mt="5px">
                  Top 5 del mes actual
                </Text>
              </Box>
              <Button
                variant='outline'
                colorScheme='blue'
                size="sm"
                borderRadius="8px"
              >
                Ver Todos
              </Button>
            </Flex>
            <Box overflow={{ sm: "scroll", lg: "hidden" }}>
              <Table variant='simple'>
                <Thead>
                  <Tr bg={tableRowColor}>
                    <Th color='gray.400' borderColor={borderColor} fontSize="xs">
                      Producto
                    </Th>
                    <Th color='gray.400' borderColor={borderColor} fontSize="xs">
                      Ventas
                    </Th>
                    <Th color='gray.400' borderColor={borderColor} fontSize="xs">
                      Ingresos
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <Tr key={i}>
                        <Td borderColor={borderColor}>
                          <Skeleton height="20px" />
                        </Td>
                        <Td borderColor={borderColor}>
                          <Skeleton height="20px" />
                        </Td>
                        <Td borderColor={borderColor}>
                          <Skeleton height="20px" />
                        </Td>
                      </Tr>
                    ))
                  ) : topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <Tr key={product.id}>
                        <Td
                          color={textTableColor}
                          fontSize='sm'
                          fontWeight='bold'
                          borderColor={borderColor}
                        >
                          <Flex align="center">
                            <Badge
                              colorScheme={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}
                              mr="10px"
                              fontSize="xs"
                            >
                              #{index + 1}
                            </Badge>
                            {product.name}
                          </Flex>
                        </Td>
                        <Td
                          color={textTableColor}
                          fontSize='sm'
                          borderColor={borderColor}
                        >
                          {product.sales}
                        </Td>
                        <Td
                          color={textTableColor}
                          fontSize='sm'
                          fontWeight='bold'
                          borderColor={borderColor}
                        >
                          {formatCurrency(product.revenue)}
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={3} textAlign="center" color="gray.400">
                        No hay datos disponibles
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Flex>
        </Card>

        {/* Productos con bajo stock */}
        <Card
          p='22px'
          bg={bgCard}
          borderRadius="15px"
          boxShadow={shadowCard}
        >
          <Flex direction='column'>
            <Flex align='center' justify='space-between' mb='20px'>
              <Box>
                <Text fontSize='lg' color={textColor} fontWeight='bold'>
                  <Icon as={FiAlertTriangle} color="orange.400" mr="8px" />
                  Stock Bajo
                </Text>
                <Text fontSize='sm' color='gray.400' mt="5px">
                  Productos que necesitan reabastecimiento
                </Text>
              </Box>
            </Flex>
            <Box overflow={{ sm: "scroll", lg: "hidden" }}>
              {loading ? (
                <Box>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} height="60px" mb="10px" borderRadius="8px" />
                  ))}
                </Box>
              ) : lowStock.length > 0 ? (
                lowStock.map((product) => (
                  <Box
                    key={product.id}
                    p="15px"
                    mb="10px"
                    bg={tableRowColor}
                    borderRadius="8px"
                    borderLeft="4px solid"
                    borderLeftColor={product.stock < 5 ? "red.400" : "orange.400"}
                  >
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontSize='sm' color={textColor} fontWeight='bold'>
                          {product.name}
                        </Text>
                        <Text fontSize='xs' color='gray.400' mt="5px">
                          Stock mínimo: {product.minStock}
                        </Text>
                      </Box>
                      <Badge
                        colorScheme={product.stock < 5 ? 'red' : 'orange'}
                        fontSize="md"
                        p="8px 12px"
                        borderRadius="8px"
                      >
                        {product.stock}
                      </Badge>
                    </Flex>
                  </Box>
                ))
              ) : (
                <Box textAlign="center" color="gray.400" py="40px">
                  <Text>Todos los productos tienen stock adecuado</Text>
                </Box>
              )}
            </Box>
          </Flex>
        </Card>

        {/* Actividad reciente */}
        <Card
          p='22px'
          bg={bgCard}
          borderRadius="15px"
          boxShadow={shadowCard}
          gridColumn={{ lg: "span 2" }}
        >
          <Flex direction='column'>
            <Flex align='center' justify='space-between' mb='20px'>
              <Box>
                <Text fontSize='lg' color={textColor} fontWeight='bold'>
                  Actividad Reciente
                </Text>
                <Text fontSize='sm' color='gray.400' mt="5px">
                  Últimas acciones en el sistema
                </Text>
              </Box>
              <Button
                variant='outline'
                colorScheme='blue'
                size="sm"
                borderRadius="8px"
              >
                Ver Bitácora
              </Button>
            </Flex>
            <Box overflow={{ sm: "scroll", lg: "hidden" }}>
              {loading ? (
                <Box>
                  {[...Array(5)].map((_, i) => (
                    <Flex key={i} align="center" mb="15px">
                      <Skeleton boxSize="40px" borderRadius="full" mr="15px" />
                      <Box flex="1">
                        <Skeleton height="15px" mb="8px" />
                        <Skeleton height="12px" width="60%" />
                      </Box>
                    </Flex>
                  ))}
                </Box>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <Flex
                    key={activity.id}
                    align='center'
                    mb='20px'
                    p="10px"
                    borderRadius="8px"
                    _hover={{ bg: tableRowColor }}
                    transition="all 0.2s"
                  >
                    <Avatar
                      name={activity.user}
                      size='sm'
                      mr='15px'
                      bg="blue.500"
                    />
                    <Box flex="1">
                      <Text fontSize='sm' color={textColor} fontWeight='bold'>
                        {activity.action}
                      </Text>
                      <Text fontSize='xs' color='gray.400' mt="3px">
                        {activity.user} • {activity.time}
                      </Text>
                    </Box>
                    {activity.amount && (
                      <Badge colorScheme='green' fontSize="sm" p="5px 10px">
                        {formatCurrency(activity.amount)}
                      </Badge>
                    )}
                  </Flex>
                ))
              ) : (
                <Box textAlign="center" color="gray.400" py="40px">
                  <Text>No hay actividad reciente</Text>
                </Box>
              )}
            </Box>
          </Flex>
        </Card>
      </Grid>
    </Flex>
  );
}
