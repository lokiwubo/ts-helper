import type {
  AllKeys,
  AnyLike,
  FilterByKey,
  ObjectEntriesUnion,
  ObjectValueUnion,
  ReadonlyUnion,
  RecordLike,
  SeniorMutable,
} from "../types";
import type { FlattenTree } from "../types/tree";
import { filterNonNullish } from "./array";

/**
 * @description 将树形结构的路由数据展平为一维数组
 * @param dateTree 路由树
 * @param needFlattenKey 要展平的键 children | routes 的key
 */
export const getFlattenByTree = <
  T extends ReadonlyUnion<RecordLike[]>,
  K extends AllKeys<T[number]>,
>(
  dateTree: T,
  flattenKey: K,
): FlattenTree<SeniorMutable<T>, K & string> => {
  return [dateTree].flat().reduce((prev, curr) => {
    if (curr[flattenKey] && Array.isArray(curr[flattenKey])) {
      return [...prev, curr, ...getFlattenByTree(curr[flattenKey], flattenKey)];
    }
    return [...prev, curr];
  }, [] as AnyLike) as AnyLike;
};

/**
 * @description 根据 flagKey 过滤出对应数据
 */
export const filterByFlagKey = <
  T extends RecordLike[],
  K extends AllKeys<T[number]> = AllKeys<T[number]>,
>(
  dataList: T,
  flagKey: K,
) => {
  return dataList.filter((item) => item.hasOwnProperty(flagKey)) as FilterByKey<
    T,
    K
  >;
};

/**
 * @description 抽取Validate数据类型
 */
type ExtractValidatedType<T> = T extends {
  validate: (value: AnyLike) => value is infer R;
}
  ? R
  : never;

type StructureTreeConfig<TData> = {
  validate: (value: AnyLike) => value is TData;
  getChildren?: (item: TData, parent?: AnyLike) => AnyLike[];
  getKey: (item: TData) => string;
};

type StructureTreeData = {
  key: string;
  children: StructureTreeData[];
};

export const createStructureTreeConfig = <TData>(
  config: StructureTreeConfig<TData>,
) => config;

/**
 * @description 构建一个标准的结构tree
 */
export const buildStructureTree = <
  TConfig extends Record<string, StructureTreeConfig<AnyLike>>,
  TData,
>(
  configMap: TConfig,
  data: TData,
) => {
  type StructureDataMap<T> = {
    metaData: T;
    parentKey?: string;
    key: string;
  };

  type ClassifyByConfig = {
    [TKey in keyof TConfig]: ExtractValidatedType<TConfig[TKey]>[];
  };

  const byKey: Record<
    string,
    StructureDataMap<
      ObjectValueUnion<{
        [TKey in keyof TConfig]: ExtractValidatedType<TConfig[TKey]>;
      }>
    >
  > = {};
  const allKeys: string[] = [];
  /**
   * @description 数据分类
   */
  const classifyByConfig: ClassifyByConfig = {} as ClassifyByConfig;

  const getValidateConfig = (data: unknown) => {
    return Object.entries(configMap).find(([_key, config]) => {
      if (config.validate(data)) {
        return config;
      }
      return null;
    }) as ObjectEntriesUnion<TConfig> | undefined;
  };
  /**
   * @description 递归构建结标准构树
   */
  const recursion = (data: unknown, parentKey?: string) => {
    if (data) {
      return filterNonNullish(
        ([] as AnyLike[]).concat(data).map((item) => {
          const validateConfig = getValidateConfig(item);
          if (validateConfig) {
            const [type, config] = validateConfig;
            if (!classifyByConfig[type]) {
              classifyByConfig[type] = [];
            }
            const key = config.getKey(item);
            const structureData: StructureTreeData = {
              key: key,
              children: recursion(
                config.getChildren?.(
                  item,
                  parentKey ? byKey[parentKey]?.metaData : undefined,
                ),
                key,
              ),
            };
            classifyByConfig[type].push(item);
            allKeys.push(config.getKey(item));
            byKey[structureData.key] = {
              metaData: item,
              parentKey: parentKey,
              key: config.getKey(item),
            };
            return structureData;
          }
          return null;
        }),
      );
    }
    return [];
  };
  return {
    /**
     * 用户配置
     */
    metaConfig: configMap,
    /**
     * 对应关联的元数据
     */
    metaDataByKey: byKey,
    /**
     * 所有的key
     */
    allKeys,
    /**
     * 元数据分类
     */
    metaDataClassifyByConfig: classifyByConfig,
    /**
     * 标准树结构
     */
    structureTree: recursion(data),
  };
};
