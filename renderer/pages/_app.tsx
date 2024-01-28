import type { AppProps } from 'next/app'
import '../app.css'
import AccountLayout from '@/components/layouts/account'
import TimelineLayout from '@/components/layouts/timelines'
import { IntlProviderWrapper } from '@/utils/i18n'
import { ThemeProvider } from '@material-tailwind/react'
import { ToastProvider } from '@/utils/toast'
import { UnreadsProvider } from '@/utils/unreads'

export default function MyApp({ Component, pageProps }: AppProps) {
  const customTheme = {
    popover: {
      styles: {
        base: {
          p: 'p-0'
        }
      }
    },
    input: {
      styles: {
        variants: {
          outlined: {
            base: {
              input: {
                floated: {
                  borderWidth: 'border focus:border'
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
                floated: {
                  borderWidth: 'border focus:border'
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
            }
          }
        }
      }
    },
    select: {
      styles: {
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
    }
  }

  return (
    <ThemeProvider value={customTheme}>
      <IntlProviderWrapper>
        <ToastProvider>
          <UnreadsProvider>
            <AccountLayout>
              <TimelineLayout>
                <Component {...pageProps} />
              </TimelineLayout>
            </AccountLayout>
          </UnreadsProvider>
        </ToastProvider>
      </IntlProviderWrapper>
    </ThemeProvider>
  )
}
