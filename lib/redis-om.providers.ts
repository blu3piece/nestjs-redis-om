import { Provider } from '@nestjs/common';
import { Repository, Schema } from 'redis-om';
import { getDataSourceToken, getRepositoryToken } from './utils/redis-om.utils';
import { RedisClient } from './interfaces/redis-client.type';
import { EntitiesMetadataStorage } from './entities-metadata.storage';
import { EntityClass } from './interfaces/entity-class-or-schema.type';

export function createRedisOmEntityProviders(
  entities?: EntityClass[],
  dataSourceName?: string,
): Provider[] {
  return (entities || []).map((entity) => ({
    provide: getRepositoryToken(entity, dataSourceName),
    useFactory: async (dataSource: RedisClient) => {
      const entityMetadata = EntitiesMetadataStorage.getEntitiesMetadata(
        entity.prototype,
      );
      const schema = new Schema(
        entityMetadata.schemaName,
        entityMetadata.fields,
        entityMetadata.schemaOptions,
      );
      const repository = new Repository(schema, dataSource);
      try {
        await repository.createIndex();
        return repository;
      } catch (error) {
        if (error.message.includes('Index already exists')) {
          // 기존 인덱스 삭제
          await repository.dropIndex();
          // 새 인덱스 생성
          await repository.createIndex();
        } else {
          throw error;
        }
      }
    },
    inject: [getDataSourceToken(dataSourceName)],
  }));
}
