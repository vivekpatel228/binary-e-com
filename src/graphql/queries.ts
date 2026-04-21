import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories @rest(type: "[Category]", path: "categories") {
      id
      name
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: Int!, $limit: Int!, $offset: Int!) {
    products(categoryId: $categoryId, limit: $limit, offset: $offset)
      @rest(
        type: "[Product]"
        path: "products/?categoryId={args.categoryId}&limit={args.limit}&offset={args.offset}"
      ) {
      id
      title
      price
      images
      category @type(name: "Category") {
        id
        name
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($limit: Int!, $offset: Int!) {
    products(limit: $limit, offset: $offset)
      @rest(
        type: "[Product]"
        path: "products/?limit={args.limit}&offset={args.offset}"
      ) {
      id
      title
      price
      images
      category @type(name: "Category") {
        id
        name
      }
    }
  }
`;

export const GET_PRODUCTS_FILTERED = gql`
  query GetProductsFiltered(
    $limit: Int!
    $offset: Int!
    $pathSuffix: String!
  ) {
    products(limit: $limit, offset: $offset, pathSuffix: $pathSuffix)
      @rest(
        type: "[Product]"
        path: "products/?limit={args.limit}&offset={args.offset}{args.pathSuffix}"
      ) {
      id
      title
      price
      images
      category @type(name: "Category") {
        id
        name
      }
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($title: String!) {
    products(title: $title)
      @rest(type: "[Product]", path: "products/?title={args.title}") {
      id
      title
      price
      images
      category @type(name: "Category") {
        id
        name
      }
    }
  }
`;

export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($id: Int!) {
    product(id: $id)
      @rest(type: "Product", path: "products/{args.id}") {
      id
      title
      price
      description
      images
      category @type(name: "Category") {
        id
        name
        image
      }
    }
  }
`;
