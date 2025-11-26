import { vi } from "vitest";
import type { AlbumApi } from "~/lib/api";
import type { AlbumWithPhotosSchemaType, PhotoSchemaType, AlbumSchemaType } from '~/schemas/album';
import type { UserSchemaType } from '~/lib/schema';

// --- Start of Dummy Data ---

const sampleUser1: UserSchemaType = {
  id: 'user1',
  name: 'Alice',
  image: 'https://i.pravatar.cc/150?u=user1',
};

const sampleUser2: UserSchemaType = {
  id: 'user2',
  name: 'Bob',
  image: 'https://i.pravatar.cc/150?u=user2',
};

const samplePhoto1: PhotoSchemaType = {
  id: 'photoABC123',
  albumId: 1,
  src: 'https://picsum.photos/seed/1/400/300',
  date: new Date('2024-01-15T10:00:00.000Z'),
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
  updatedAt: new Date('2024-01-15T10:00:00.000Z')
};

const samplePhoto2: PhotoSchemaType = {
  id: 'photoDEF456',
  albumId: 1,
  src: 'https://picsum.photos/seed/2/400/300',
  date: new Date('2024-01-16T11:00:00.000Z'),
  createdAt: new Date('2024-01-16T11:00:00.000Z'),
  updatedAt: new Date('2024-01-16T11:00:00.000Z'),
};

const samplePhoto3: PhotoSchemaType = {
  id: 'photoGHI789',
  albumId: 2,
  src: 'https://picsum.photos/seed/3/400/300',
  date: new Date('2024-02-10T12:00:00.000Z'),
  createdAt: new Date('2024-02-10T12:00:00.000Z'),
  updatedAt: new Date('2024-02-10T12:00:00.000Z'),
};

const sampleAlbum1: AlbumSchemaType = {
  id: 'albumXYZ789',
  name: 'Trip to the Mountains',
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  groupId: 1,
  createdAt: new Date("2024-02-10T12:00:00.000Z"),
  updatedAt: new Date("2024-02-10T12:00:00.000Z")
}

const sampleAlbumWithPhotos1: AlbumWithPhotosSchemaType = {
  ...sampleAlbum1,
  photos: [samplePhoto1, samplePhoto2],
}

const sampleAlbum2: AlbumWithPhotosSchemaType = {
  id: 'albumPQR456',
  name: 'Beach Vacation',
  startDate: '2024-02-10',
  endDate: '2024-02-12',
  groupId: 1,
  photos: [samplePhoto3],
  createdAt: new Date("2024-02-10"),
  updatedAt: new Date("2024-02-10"),
};

const sampleGroup1 = {
  id: 1,
  name: "Family",
  albums: [sampleAlbumWithPhotos1, sampleAlbum2],
  users: [sampleUser1, sampleUser2],
}

// --- End of Dummy Data ---

export const createAlbumApiMock = (): AlbumApi => ({
  getGroupsByUser: vi.fn().mockResolvedValue([sampleGroup1]),
  getAlbumsByGroup: vi.fn().mockImplementation((groupId: number) => {
    if (groupId === 1) {
        return Promise.resolve([sampleAlbumWithPhotos1, sampleAlbum2]);
    }
    return Promise.resolve([]);
  }),
  isGroupMember: vi.fn().mockResolvedValue(true),
  canUserAccessAlbum: vi.fn().mockResolvedValue(true),
  createGroup: vi.fn().mockResolvedValue({ createdGroupId: 2 }),
  addUserToGroup: vi.fn().mockResolvedValue(undefined),
  getAlbum: vi.fn().mockImplementation((albumId: string) => {
    if (albumId === sampleAlbum1.id) {
        return Promise.resolve({ album: sampleAlbum1, photos: [samplePhoto1, samplePhoto2]});
    }
    if (albumId === sampleAlbum2.id) {
        const { photos, ...album } = sampleAlbum2
        return Promise.resolve({ album, photos });
    }
    return Promise.resolve(null);
  }),
  createAlbum: vi.fn().mockResolvedValue({ createdAlbumId: "newAlbumId123" }),
  updateAlbum: vi.fn().mockResolvedValue(undefined),
  deleteAlbum: vi.fn().mockResolvedValue(undefined),
  createPhotos: vi.fn().mockResolvedValue({ createdPhotoIds: [101, 102], fileDatas: [{ fileHash: 'hash1', fileSize: 12345}, {fileHash: 'hash2', fileSize: 67890}] }),
  deletePhotos: vi.fn().mockResolvedValue(undefined),
});