import swaggerJSDoc from 'swagger-jsdoc'

export const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API for e-commerce application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'https://ecom.vittapcode.id.vn/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        GenderEnum: {
          type: 'string',
          enum: ['male', 'female', 'other'],
          example: 'male'
        },
        BaseResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              example: 200
            },
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              example: 'Successfully'
            },
            timestamp: {
              type: 'string',
              example: '1/5/2025, 9:32:29 PM'
            }
          }
        },
        LoginResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    accessToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJSUzI1NiIsIn...'
                    },
                    refreshToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6Ikp...'
                    }
                  }
                }
              }
            }
          ]
        },
        RefreshTokenResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    accessToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJSUzI1NiIsIn...'
                    },
                    refreshToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6Ikp...'
                    }
                  }
                }
              }
            }
          ]
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            fullName: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              example: 'Password123!'
            },
            confirmPassword: {
              type: 'string',
              example: 'Password123!'
            }
          },
          required: ['fullName', 'email', 'password', 'confirmPassword']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              example: 'Password123!'
            },
            deviceName: {
              type: 'string',
              example: 'Chrome'
            },
            deviceType: {
              type: 'string',
              example: 'Ubuntu'
            }
          },
          required: ['email', 'password', 'deviceName', 'deviceType']
        },
        VerifyOtpRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              example: 'john.doe@example.com'
            },
            token: {
              type: 'string',
              example: '123456'
            },
            required: ['email', 'token']
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          properties: {
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOi...'
            },
            deviceName: {
              type: 'string',
              example: 'Chrome'
            },
            deviceType: {
              type: 'string',
              example: 'Ubuntu'
            }
          },
          required: ['refreshToken', 'deviceName', 'deviceType']
        },
        ResetPasswordRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              example: 'john.doe@example.com'
            },
            token: {
              type: '123456',
              example: 'john.doe@example.com'
            },
            newPassword: {
              type: 'string',
              example: 'Password123!'
            },
            confirmNewPassword: {
              type: 'string',
              example: 'Password123!'
            }
          },
          required: ['email', 'token', 'newPassword', 'confirmNewPassword']
        },
        ForgotPasswordRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              example: 'john.doe@example.com'
            }
          },
          required: ['email']
        },
        ChangePasswordRequest: {
          type: 'object',
          properties: {
            currentPassword: {
              type: 'string',
              example: 'Password123!'
            },
            newPassword: {
              type: 'string',
              example: 'Password123!'
            },
            confirmNewPassword: {
              type: 'string',
              example: 'Password123!'
            }
          },
          required: ['currentPassword', 'newPassword', 'confirmNewPassword']
        },
        ImageSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '1'
            },
            filename: {
              type: 'string',
              example: 'filename.webp'
            },
            width: {
              type: 'integer',
              example: 100
            },
            height: {
              type: 'integer',
              example: 100
            }
          }
        },
        ProfileSchema: {
          type: 'object',
          properties: {
            gender: {
              $ref: '#/components/schemas/GenderEnum'
            },
            dateOfBirth: {
              type: 'string',
              example: '2000-01-01'
            },
            bio: {
              type: 'string',
              example: 'Hello, I am John Doe'
            },
            phone: {
              type: 'string',
              example: '0123456789'
            },
            website: {
              type: 'string',
              example: 'https://example.com'
            },
            facebookUrl: {
              type: 'string',
              example: 'https://facebook.com/johndoe'
            },
            twitterUrl: {
              type: 'string',
              example: 'https://twitter.com/johndoe'
            },
            instagramUrl: {
              type: 'string',
              example: 'https://instagram.com/johndoe'
            }
          }
        },
        AddressSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '1'
            },
            streetNumber: {
              type: 'string',
              example: '123'
            },
            streetName: {
              type: 'string',
              example: 'Street'
            },
            ward: {
              type: 'string',
              example: 'Ward'
            },
            district: {
              type: 'string',
              example: 'District'
            },
            province: {
              type: 'string',
              example: 'Province'
            },
            note: {
              type: 'string',
              example: 'Near the school'
            },
            isDefault: {
              type: 'boolean',
              example: true
            }
          },
          required: ['streetNumber', 'streetName', 'ward', 'district', 'province']
        },
        AddressesResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AddressSchema'
                  }
                }
              }
            }
          ]
        },
        UploadImage: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
                contentMediaType: 'image/*'
              },
              description: 'Array of image files',
              maxItems: 1,
              minItems: 1
            }
          },
          required: ['files']
        },
        UploadResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ImageSchema'
                  }
                }
              }
            }
          ]
        },
        MetaSchema: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 24
            },
            totalItems: {
              type: 'integer',
              example: 2
            },
            totalPages: {
              type: 'integer',
              example: 1
            },
            hasNextPage: {
              type: 'boolean',
              example: false
            },
            hasPreviousPage: {
              type: 'boolean',
              example: false
            },
            sortBy: {
              type: 'string',
              example: 'createdAt'
            },
            sortDirection: {
              type: 'string',
              example: 'ASC'
            }
          }
        },
        ImageDataResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: '0194351d-a8fd-710c-ba48-44b09214ea6e'
                          },
                          fileName: {
                            type: 'string',
                            example: '0194351ccf46764db14a0c6968ca6db5.webp'
                          },
                          width: {
                            type: 'integer',
                            example: 1920
                          },
                          height: {
                            type: 'integer',
                            example: 1280
                          }
                        }
                      }
                    },
                    meta: {
                      $ref: '#/components/schemas/MetaSchema'
                    }
                  }
                }
              }
            }
          ]
        },
        UpdateProfileResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  $ref: '#/components/schemas/ProfileSchema'
                }
              }
            }
          ]
        },
        CreateCategoryRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Category Name'
            },
            parentId: {
              type: 'string',
              example: '1'
            },
            imageFilename: {
              type: 'string',
              example: 'filename.webp'
            }
          },
          required: ['name']
        },
        UpdateCategoryRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Category Name'
            },
            imageFilename: {
              type: 'string',
              example: 'filename.webp'
            }
          },
          required: ['name']
        },
        CategorySchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '1'
            },
            name: {
              type: 'string',
              example: 'Category Name'
            },
            slug: {
              type: 'string',
              example: 'category-name'
            },
            level: {
              type: 'integer',
              example: 1
            },
            image: {
              $ref: '#/components/schemas/ImageSchema'
            }
          }
        },
        CreateCategoryResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: '1'
                    },
                    name: {
                      type: 'string',
                      example: 'Category Name'
                    },
                    slug: {
                      type: 'string',
                      example: 'category-name'
                    },
                    level: {
                      type: 'integer',
                      example: 1
                    },
                    image: {
                      $ref: '#/components/schemas/ImageSchema'
                    },
                    parent: {
                      $ref: '#/components/schemas/CategorySchema'
                    }
                  }
                }
              }
            }
          ]
        },
        UpdateCategoryResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  $ref: '#/components/schemas/CategorySchema'
                }
              }
            }
          ]
        },
        GetCategoriesResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/CategorySchema'
                  }
                }
              }
            }
          ]
        },
        GetCategoryResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  $ref: '#/components/schemas/CategorySchema'
                }
              }
            }
          ]
        },
        CreateShopRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Shop Name'
            },
            slogan: {
              type: 'string',
              example: 'Shop Slogan'
            },
            address: {
              $ref: '#/components/schemas/UpdateAddressShopRequest'
            },
            description: {
              type: 'string',
              example: 'Shop Description'
            },
            logo: {
              type: 'string',
              example: 'filename.webp'
            },
            banner: {
              type: 'string',
              example: 'filename.webp'
            }
          },
          required: ['name', 'slogan', 'address', 'description', 'logo']
        },
        CreateShopResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: '1'
                    },
                    name: {
                      type: 'string',
                      example: 'Shop Name'
                    },
                    slogan: {
                      type: 'string',
                      example: 'Shop Slogan'
                    },
                    slug: {
                      type: 'string',
                      example: 'shop-name'
                    },
                    address: {
                      $ref: '#/components/schemas/UpdateAddressShopRequest'
                    },
                    description: {
                      type: 'string',
                      example: 'Shop Description'
                    },
                    logo: {
                      $ref: '#/components/schemas/ImageSchema'
                    },
                    banner: {
                      $ref: '#/components/schemas/ImageSchema'
                    }
                  }
                }
              }
            }
          ]
        },
        UpdateShopRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Shop Name'
            },
            slogan: {
              type: 'string',
              example: 'Shop Slogan'
            },
            description: {
              type: 'string',
              example: 'Shop Description'
            },
            logo: {
              type: 'string',
              example: 'filename.webp'
            },
            banner: {
              type: 'string',
              example: 'filename.webp'
            }
          }
        },
        UpdateShopResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  $ref: '#/components/schemas/ShopSchema'
                }
              }
            }
          ]
        },
        ShopSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '1'
            },
            name: {
              type: 'string',
              example: 'Shop Name'
            },
            slogan: {
              type: 'string',
              example: 'Shop Slogan'
            },
            slug: {
              type: 'string',
              example: 'shop-name'
            },
            address: {
              $ref: '#/components/schemas/AddressSchema'
            },
            description: {
              type: 'string',
              example: 'Shop Description'
            },
            logo: {
              $ref: '#/components/schemas/ImageSchema'
            },
            banner: {
              $ref: '#/components/schemas/ImageSchema'
            }
          }
        },
        UpdateAddressShopRequest: {
          type: 'object',
          properties: {
            streetNumber: {
              type: 'string',
              example: '123'
            },
            streetName: {
              type: 'string',
              example: 'Street'
            },
            ward: {
              type: 'string',
              example: 'Ward'
            },
            district: {
              type: 'string',
              example: 'District'
            },
            province: {
              type: 'string',
              example: 'Province'
            },
            note: {
              type: 'string',
              example: 'Near the school'
            }
          },
          required: ['streetNumber', 'streetName', 'ward', 'district', 'province']
        },
        ShopResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  $ref: '#/components/schemas/ShopSchema'
                }
              }
            }
          ]
        },
        ShopsResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ShopSchema'
                      }
                    },
                    meta: {
                      $ref: '#/components/schemas/MetaSchema'
                    }
                  }
                }
              }
            }
          ]
        },
        CreateProductRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Product Name'
            },
            description: {
              type: 'string',
              example: 'Product Description'
            },
            categoryId: {
              type: 'string',
              example: '019450da-5dcb-751c-9a19-aa53d375e819'
            },
            attributes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'Size'
                  },
                  value: {
                    type: 'string',
                    example: 'XL'
                  }
                }
              }
            },
            variants: {
              type: 'object',
              properties: {
                sku: {
                  type: 'string',
                  example: 'SKU123'
                },
                price: {
                  type: 'float',
                  example: 100.0
                },
                oldPrice: {
                  type: 'float',
                  example: 100.0
                },
                stock: {
                  type: 'integer',
                  example: 10
                },
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      variantName: {
                        type: 'string',
                        example: 'Color'
                      },
                      value: {
                        type: 'string',
                        example: 'Red'
                      },
                      imageFilename: {
                        type: 'string',
                        example: 'filename.webp'
                      }
                    }
                  }
                }
              }
            },
            thumbnail: {
              type: 'string',
              example: 'filename.webp'
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                example: 'filename.webp'
              }
            },
            status: {
              type: 'enum',
              enum: ['available', 'sold_out', 'coming_soon', 'discontinued', 'preorder'],
              example: 'available'
            }
          },
          required: [
            'name',
            'description',
            'categoryId',
            'shopId',
            'images',
            'attributes',
            'variants',
            'thumbnail',
            'thumbnail'
          ]
        },
        ProductResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: '1'
                    },
                    price: {
                      type: 'float',
                      example: 100.0
                    },
                    name: {
                      type: 'string',
                      example: 'Product Name'
                    },
                    slug: {
                      type: 'string',
                      example: 'product-name'
                    },
                    thumbnail: {
                      $ref: '#/components/schemas/ImageSchema'
                    },
                    images: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ImageSchema'
                      }
                    },
                    description: {
                      type: 'string',
                      example: 'Product Description'
                    },
                    category: {
                      $ref: '#/components/schemas/CategorySchema'
                    },
                    status: {
                      type: 'string',
                      example: 'available'
                    },
                    attributes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                            example: 'Size'
                          },
                          value: {
                            type: 'string',
                            example: 'XL'
                          }
                        }
                      }
                    },
                    variants: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          sku: {
                            type: 'string',
                            example: 'SKU123'
                          },
                          price: {
                            type: 'float',
                            example: 100.0
                          },
                          oldPrice: {
                            type: 'float',
                            example: 100.0
                          },
                          stock: {
                            type: 'integer',
                            example: 10
                          },
                          options: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                variantName: {
                                  type: 'string',
                                  example: 'Color'
                                },
                                value: {
                                  type: 'string',
                                  example: 'Red'
                                },
                                image: {
                                  $ref: '#/components/schemas/ImageSchema'
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    variantGroups: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                            example: 'Color'
                          },
                          values: {
                            type: 'array',
                            items: {
                              type: 'string',
                              example: 'Red'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          ]
        },
        ProductListResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '1'
            },
            price: {
              type: 'float',
              example: 100.0
            },
            name: {
              type: 'string',
              example: 'Product Name'
            },
            slug: {
              type: 'string',
              example: 'product-name'
            },
            thumbnail: {
              $ref: '#/components/schemas/ImageSchema'
            },
            description: {
              type: 'string',
              example: 'Product Description'
            },
            status: {
              type: 'string',
              example: 'available'
            }
          }
        },
        PaginatedProductResponse: {
          allOf: [
            { $ref: '#/components/schemas/BaseResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ProductListResponse'
                      }
                    },
                    meta: {
                      $ref: '#/components/schemas/MetaSchema'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/route/**/*.ts'] // path to your API routes
}
