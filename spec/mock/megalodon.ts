import Mastodon, { MegalodonInstance } from 'megalodon'

interface MockedMegalodon extends MegalodonInstance {
  mockResolvedValue: Function
  mockImplementation: Function
  mockClear: Function
}

const mockedMegalodon: jest.Mocked<MockedMegalodon> = Mastodon as any
export default mockedMegalodon
