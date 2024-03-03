import React, { useState, useEffect } from "react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import {
  Typography,
  Container,
  Box,
  List,
  ListItem,
  Checkbox,
  FormControlLabel,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Pagination,
  Stack,
  Slider,
  Paper,
  InputBase,
  FormControl,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import HomeIcon from "@mui/icons-material/Home";
import Grid from "@mui/material/Unstable_Grid2";
import "./styled/ServiceList.css";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import { Link as RouterLink } from "react-router-dom";

const BASE_URL = "http://localhost:3500";

const DsCheckbox = styled(Checkbox)`
  color: #eeeeee !important;
  &.Mui-checked {
    color: #000 !important;
  }
`;

function ServiceItem({ service }) {
  const { _id, serviceName, price, serviceImage } = service;
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card className="product-card">
        <CardActionArea component={RouterLink} to={`/service-homepage/${_id}`}>
          <CardMedia
            component="img"
            height="200"
            image={serviceImage}
            alt={serviceName}
          />
          <CardContent sx={{ textAlign: "center" }}>
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              className="product-title"
            >
              {serviceName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className="product-price"
            >
              {price} VND{" "}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions sx={{ justifyContent: "center" }}>
          <IconButton
            size="large"
            color="primary"
            aria-label="add to shopping cart"
          >
            <AddShoppingCartIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Grid>
  );
}

export default function ServiceList() {
  const [checkedItems, setCheckedItems] = useState({
    "Khám và điều trị": false,
    "Thẩm mỹ": false,
    "Lưu chuồng": false,
    "Xét nghiệm": false,
  });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckedItems({ ...checkedItems, [name]: checked });
  };

  const [price, setPrice] = useState([0, 200]);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = React.useState("price-asc");

  const [data, setData] = useState([]);
  const [totalServices, setTotalServices] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const context = useAuth();

  const handlePriceChange = (event, newPrice) => {
    setPrice(newPrice);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // ----------------------------------- API GET ALL SERVICE --------------------------------
  useEffect(() => {
    loadAllService(currentPage);
  }, []);

  const loadAllService = async (page) => {
    try {
      const loadData = await axios.get(
        `${BASE_URL}/service?page=${page}&limit=12&status=true`
      );
      if (loadData.error) {
        toast.error(loadData.error);
      } else {
        // console.log("check data", loadData.data.docs);
        setTotalPages(loadData.data.pages);
        // console.log("Check totalPage", totalPages);
        setData(loadData.data.docs);
        setTotalServices(loadData.data.limit);
        // console.log(loadData.data);
        setCurrentPage(loadData.data.page);
      }
    } catch (err) {
      console.log(err);
    }
  };

   // --------------------- GET ALL SERVICE BY CATEGORY ID SERVICE -----------------------------
   async function hanldeClickCategory(page, cateId) {
    // console.log("Check data cate ID", cateId);
    setCategoryId(cateId);
    if (cateId === undefined || cateId === "") {
      loadAllService(currentPage);
    } else {
      try {
        const loadData = await axios.get(
          `http://localhost:3500/service?page=${page}&categoryId=${cateId}&status=true&limit=9`
        );
        if (loadData.error) {
          toast.error(loadData.error);
        } else {
          // console.log("Check loaddata", loadData.data);
          setTotalPages(loadData.data.pages);
          // console.log("Check totalPage", totalPages);
          setData(loadData.data.docs);
          setTotalServices(loadData.data.limit);
          setCurrentPage(loadData.data.page);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  useEffect(() => {
    hanldeClickCategory();
  }, []);

  // --------------------- Hanlde Search -----------------------------
  const [keyword, setKeyword] = useState("");

  // --------------------- Click paging -----------------------------
  const [categoryId, setCategoryId] = useState("");
  const handlePageClick = (event, value) => {
    setCurrentPage(value);
    if (categoryId) {
      // console.log(categoryId);
      hanldeClickCategory(value, categoryId);
    } else if (keyword.trim()) {
      searchServiceByName(value);
    } else {
      // console.log(categoryId);
      loadAllService(value);
    }
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  const handleSearchClick = async () => {
    if (keyword.trim() === "") {
      toast.warning("Hãy nhập kết quả bạn cần tìm");
      loadAllService(currentPage);
    } else {
      searchServiceByName();
    }
  };

   // ----------------------------------- GET ALL SERVICE BY SERVICE NAME --------------------------------
   const searchServiceByName = async (page) => {
    try {
      const loadData = await axios.get(
        `${BASE_URL}/service?service=${keyword.trim()}&page=${page}&limit=9`
      );
      if (loadData.data.error) {
        toast.warning(
          "Kết quả " +
            "[" +
            keyword +
            "]" +
            " bạn vừa tìm không có! Vui lòng nhập lại."
        );
        loadAllService(currentPage);
      } else {
        setData(loadData.data.docs);
        setTotalServices(loadData.data.limit);
        setTotalPages(loadData.data.pages);
        // console.log(loadData.data);
        setCurrentPage(loadData.data.page);
      }
    } catch (err) {
      console.log(err);
    }
  };


  return (
    <>
      <Header />
      <Container
        sx={{ position: "relative", top: "120px", paddingBottom: "200px" }}
      >
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ marginBottom: "30px" }}
          separator={<KeyboardDoubleArrowRightIcon fontSize="small" />}
        >
          <Link
            underline="hover"
            sx={{ display: "flex", alignItems: "center" }}
            color="inherit"
            href="/"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="medium" />
            Trang chủ
          </Link>
          <Link
            underline="hover"
            sx={{ display: "flex", alignItems: "center" }}
            color="#000000"
            href="/product-homepage"
          >
            Dịch vụ
          </Link>
        </Breadcrumbs>
        <Grid container spacing={1}>
          <Grid item sm={12} md={3} lg={3} className="sidebar">
            <Box className="product_filter">
              <Box className="category">
                <Typography variant="h3" className="title">
                  Danh mục
                </Typography>
                <List className="list-categories">
                  {Object.keys(checkedItems).map((label) => (
                    <ListItem key={label} className="list-categories-item">
                      <FormControlLabel
                        control={
                          <DsCheckbox
                            size="small"
                            checked={checkedItems[label]}
                            onChange={handleCheckboxChange}
                            name={label}
                          />
                        }
                        label={label}
                        sx={{
                          fontSize: "12px",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box className="price">
                <Typography variant="h3" className="title">
                  Giá
                </Typography>
                <Box className="price-slider-wrapper">
                  <Slider
                    className="slider"
                    size="medium"
                    value={price}
                    onChange={handlePriceChange}
                    valueLabelDisplay="off"
                    aria-labelledby="range-slider"
                    getAriaValueText={(value) => `${value}`}
                    min={0}
                    max={1000}
                  />
                  <Box className="price-slider-amount">
                    <Typography
                      variant="body1"
                      component="span"
                      className="from"
                    >
                      ${price[0]}
                    </Typography>
                    <Typography variant="body1" component="span" className="to">
                      ${price[1]}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box className="brand"></Box>
              <Box className="popular_tag"></Box>
            </Box>
          </Grid>
          <Grid item sm={12} md={9} lg={9} className="content-area">
            <Box className="site-main">
              <Typography variant="h3">Dịch vụ</Typography>
              <Grid container className="shop-top-control">
                <Grid item xl={9} lg={9}>
                  <Paper
                    component="form"
                    sx={{
                      p: "1px 4px",
                      display: "flex",
                      alignItems: "center",
                      width: "90%",
                    }}
                  >
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="Tìm dịch vụ ... "
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <IconButton sx={{ p: "10px" }} aria-label="search">
                      <SearchIcon />
                    </IconButton>
                  </Paper>
                </Grid>
                <Grid item xl={3} lg={3}>
                  <FormControl fullWidth size="medium">
                    <Select
                      className="sort-by-select"
                      value={sortBy}
                      onChange={handleSortChange}
                      fullWidth
                    >
                      <MenuItem className="menu-item" value={"price-asc"}>
                        Giá: Thấp đến Cao
                      </MenuItem>
                      <MenuItem className="menu-item" value={"price-desc"}>
                        Giá: Cao đến Thấp
                      </MenuItem>
                      <MenuItem className="menu-item" value={"rating"}>
                        Đánh giá
                      </MenuItem>
                      <MenuItem className="menu-item" value={"newest"}>
                        Mới nhất
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                {data.map((service, index) => (
                  <ServiceItem key={index} service={service} />
                ))}
              </Grid>
              <Stack
                spacing={2}
                sx={{ paddingTop: "20px", alignItems: "center" }}
              >
                <Pagination
                  count={totalPages}
                  onChange={handlePageClick}
                  page={currentPage}
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
