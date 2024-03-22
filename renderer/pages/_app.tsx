import type { AppProps } from 'next/app'
import '../app.scss'
import AccountLayout from '@/components/layouts/account'
import TimelineLayout from '@/components/layouts/timelines'
import { IntlProviderWrapper } from '@/provider/i18n'
import { ThemeProvider } from '@material-tailwind/react'
import { ToastProvider } from '@/provider/toast'
import { UnreadsProvider } from '@/provider/unreads'
import { AccountsProvider } from '@/provider/accounts'

export default function MyApp({ Component, pageProps }: AppProps) {
  const customTheme = {
    popover: {
      styles: {
        base: {
          bg: 'bg-white dark:bg-gray-900',
          p: 'p-0',
          border: 'border border-blue-gray-50 dark:border-blue-gray-800',
          boxShadow: 'shadow-lg shadow-blue-gray-500/10 dark:shadow-blue-gray-200/10'
        }
      }
    },
    input: {
      styles: {
        variants: {
          outlined: {
            base: {
              input: {
                borderWidth: 'placeholder-shown:border dark:placeholder-shown:border',
                borderColor:
                  'placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 dark:placeholder-shown:border-blue-gray-700 dark:placeholder-shown:border-t-blue-gray-700',
                floated: {
                  borderWidth: 'border focus:border dark:focus:border',
                  borderColor: 'border-t-transparent focus:border-t-transparent dark:border-t-transparent dark:focus:border-t-transparent'
                }
              },
              label: {
                before: {
                  floated: {
                    bt: 'before:border-t peer-focus:before:border-t-1',
                    bl: 'before:border-l peer-focus:before:border-l-1'
                  }
                },
                after: {
                  floated: {
                    bt: 'after:border-t peer-focus:after:border-t-1',
                    br: 'after:border-r peer-focus:after:border-r-1'
                  }
                }
              }
            },
            colors: {
              input: {
                'blue-gray': {
                  color: 'text-blue-gray-900 dark:text-white',
                  borderColor: 'border-blue-gray-200',
                  borderColorFocused: 'focus:border-blue-gray-500 dark:focus:border-blue-gray-500'
                }
              }
            }
          }
        }
      }
    },
    textarea: {
      styles: {
        variants: {
          outlined: {
            base: {
              textarea: {
                borderWidth: 'placeholder-shown:border dark:placeholder-shown:border',
                borderColor:
                  'placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 dark:placeholder-shown:border-blue-gray-700 dark:placeholder-shown:border-t-blue-gray-700',
                floated: {
                  borderWidth: 'border focus:border dark:focus:border',
                  borderColor: 'border-t-transparent focus:border-t-transparent dark:border-t-transparent dark:focus:border-t-transparent'
                }
              },
              label: {
                before: {
                  floated: {
                    bt: 'before:border-t peer-focus:before:border-t-1',
                    bl: 'before:border-l peer-focus:before:border-l-1'
                  }
                },
                after: {
                  floated: {
                    bt: 'after:border-t peer-focus:after:border-t-1',
                    br: 'after:border-r peer-focus:after:border-r-1'
                  }
                }
              }
            },
            colors: {
              textarea: {
                'blue-gray': {
                  color: 'text-blue-gray-900 dark:text-white',
                  borderColor: 'border-blue-gray-200',
                  borderColorFocused: 'focus:border-blue-gray-500 dark:focus:border-blue-gray-500'
                }
              }
            }
          }
        }
      }
    },
    select: {
      styles: {
        base: {
          select: {
            color: 'text-blue-gray-700 dark:text-blue-gray-200'
          },
          menu: {
            bg: 'bg-white dark:bg-gray-900',
            border: 'border border-blue-gray-50 dark:border-blue-gray-800'
          }
        },
        variants: {
          outlined: {
            states: {
              open: {
                select: {
                  borderWidth: 'border'
                },
                label: {
                  before: {
                    bt: 'before:border-t',
                    bl: 'before:border-l'
                  },
                  after: {
                    bt: 'after:border-t',
                    br: 'after:border-r'
                  }
                }
              }
            }
          }
        }
      }
    },
    radio: {
      styles: {
        base: {
          label: {
            color: 'text-gray-700 dark:text-gray-400'
          }
        }
      }
    },
    dialog: {
      styles: {
        base: {
          container: {
            bg: 'bg-white dark:bg-gray-900',
            color: 'text-blue-gray-500 dark:text-blue-gray-400'
          }
        }
      }
    },
    dialogHeader: {
      styles: {
        base: {
          color: 'text-blue-gray-900 dark:text-blue-gray-100'
        }
      }
    },
    dialogBody: {
      defaultProps: {
        className: '',
        divider: false
      },
      styles: {
        base: {
          initial: {
            color: 'text-blue-gray-500 dark:text-blue-gray-300'
          }
        }
      }
    },
    list: {
      styles: {
        base: {
          list: {
            color: 'text-blue-gray-700 dark:text-blue-gray-300'
          },
          item: {
            selected: {
              color: 'text-blue-gray-700 dark:text-blue-gray-900'
            }
          }
        }
      }
    },
    button: {
      styles: {
        variants: {
          outlined: {
            white: {
              focus: 'focus:ring-0'
            },
            'blue-gray': {
              focus: 'focus:ring-0'
            },
            gray: {
              focus: 'focus:ring-0'
            },
            brown: {
              focus: 'focus:ring-0'
            },
            'deep-orange': {
              focus: 'focus:ring-0'
            },
            orange: {
              focus: 'focus:ring-0'
            },
            amber: {
              focus: 'focus:ring-0'
            },
            yellow: {
              focus: 'focus:ring-0'
            },
            lime: {
              focus: 'focus:ring-0'
            },
            'light-green': {
              focus: 'focus:ring-0'
            },
            green: {
              focus: 'focus:ring-0'
            },
            teal: {
              focus: 'focus:ring-0'
            },
            cyan: {
              focus: 'focus:ring-0'
            },
            'light-blue': {
              focus: 'focus:ring-0'
            },
            blue: {
              focus: 'focus:ring-0'
            },
            indigo: {
              focus: 'focus:ring-0'
            },
            'deep-purple': {
              focus: 'focus:ring-0'
            },
            purple: {
              focus: 'focus:ring-0'
            },
            pink: {
              focus: 'focus:ring-0'
            },
            red: {
              focus: 'focus:ring-0'
            }
          }
        }
      }
    },
    iconButton: {
      styles: {
        variants: {
          outlined: {
            white: {
              focus: 'focus:ring-0'
            },
            'blue-gray': {
              focus: 'focus:ring-0'
            },
            gray: {
              focus: 'focus:ring-0'
            },
            brown: {
              focus: 'focus:ring-0'
            },
            'deep-orange': {
              focus: 'focus:ring-0'
            },
            orange: {
              focus: 'focus:ring-0'
            },
            amber: {
              focus: 'focus:ring-0'
            },
            yellow: {
              focus: 'focus:ring-0'
            },
            lime: {
              focus: 'focus:ring-0'
            },
            'light-green': {
              focus: 'focus:ring-0'
            },
            green: {
              focus: 'focus:ring-0'
            },
            teal: {
              focus: 'focus:ring-0'
            },
            cyan: {
              focus: 'focus:ring-0'
            },
            'light-blue': {
              focus: 'focus:ring-0'
            },
            blue: {
              focus: 'focus:ring-0'
            },
            indigo: {
              focus: 'focus:ring-0'
            },
            'deep-purple': {
              focus: 'focus:ring-0'
            },
            purple: {
              focus: 'focus:ring-0'
            },
            pink: {
              focus: 'focus:ring-0'
            },
            red: {
              focus: 'focus:ring-0'
            }
          }
        }
      }
    },
    progress: {
      styles: {
        base: {
          container: {
            initial: {
              bg: 'bg-blue-gray-50 dark:bg-blue-gray-800'
            }
          }
        }
      }
    },
    tabsHeader: {
      defaultProps: {
        className: ''
      },
      styles: {
        base: {
          bg: 'bg-blue-gray-50 dark:bg-blue-gray-800'
        }
      }
    },
    tab: {
      defaultProps: {
        className: '',
        activeClassName: '',
        disabled: false
      },
      styles: {
        base: {
          tab: {
            initial: {
              color: 'text-blue-gray-900 dark:text-blue-gray-200'
            }
          },
          indicator: {
            bg: 'bg-white dark:bg-gray-700'
          }
        }
      }
    }
  }

  return (
    <ThemeProvider value={customTheme}>
      <IntlProviderWrapper>
        <ToastProvider>
          <UnreadsProvider>
            <AccountsProvider>
              <AccountLayout>
                <TimelineLayout>
                  <Component {...pageProps} />
                </TimelineLayout>
              </AccountLayout>
            </AccountsProvider>
          </UnreadsProvider>
        </ToastProvider>
      </IntlProviderWrapper>
    </ThemeProvider>
  )
}
