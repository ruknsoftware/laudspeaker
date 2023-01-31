import { RadioGroup } from "@headlessui/react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Input } from "components/Elements";
import React, { FC } from "react";
import { DatabaseStepProps } from "../Database";

export enum DBType {
  DATABRICKS = "databricks",
  POSTGRESQL = "postgresql",
}

const memoryOptions: Record<
  string,
  { id: DBType; name: string; inStock: boolean }
> = {
  databricks: {
    id: DBType.DATABRICKS,
    name: "Databricks",
    inStock: true,
  },
  postgresql: {
    id: DBType.POSTGRESQL,
    name: "PostgreSQL",
    inStock: false,
  },
  // mysql: { id: "mysql", name: "MySQL", inStock: false },
  // sqlServer: { id: "sqlServer", name: "SQL Server", inStock: false },
};

const protocols: Record<string, string> = {
  databricks: "",
  postgresql: "postgresql://",
  // mysql: "mysqlx://",
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const DatabaseStep3: FC<DatabaseStepProps> = ({
  formData,
  setFormData,
  errors,
  showErrors,
  handleShowErrors,
}) => {
  const dbType = formData.dbType;
  const mem = memoryOptions[dbType];

  return (
    <div>
      <div className="space-y-1">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Select Your Database Type
        </h3>
      </div>
      <div className="space-y-10 mb-[10px]">
        <RadioGroup
          value={mem}
          onChange={(m) =>
            setFormData({
              ...formData,
              dbType: m.id,
              connectionString: protocols[m.id],
            })
          }
          className="mt-2"
        >
          <RadioGroup.Label className="sr-only">
            Choose a memory option
          </RadioGroup.Label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Object.values(memoryOptions).map((option) => (
              <RadioGroup.Option
                key={option.name}
                value={option}
                className={({ active, checked }) =>
                  classNames(
                    option.inStock
                      ? "cursor-pointer focus:outline-none"
                      : "opacity-25 cursor-not-allowed",
                    active ? "ring-2 ring-offset-2 ring-cyan-500" : "",
                    checked
                      ? "bg-cyan-600 border-transparent text-white hover:bg-cyan-700"
                      : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50",
                    "border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1"
                  )
                }
                disabled={!option.inStock}
              >
                <RadioGroup.Label as="span">{option.name}</RadioGroup.Label>
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>
      {dbType &&
        (dbType === DBType.DATABRICKS ? (
          <div className="mt-[20px] flex flex-col gap-[10px]">
            <b>Params separeted</b>
            <div>
              <dd className="relative">
                <Input
                  value={formData.databricksData.host}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      databricksData: {
                        ...formData.databricksData,
                        host: e.target.value,
                      },
                    })
                  }
                  onBlur={() => handleShowErrors("databricksData")}
                  className={classNames(
                    errors.databricksData.length > 0 &&
                      showErrors.databricksData
                      ? "rounded-md sm:text-sm focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500 "
                      : "rounded-md sm:text-sm focus:border-cyan-500 border-gray-300 shadow-sm focus:ring-cyan-500 "
                  )}
                  name="host"
                  placeholder="host"
                  label="Host"
                />
                {errors.databricksData.length > 0 && showErrors.databricksData && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dd className="relative">
                <Input
                  value={formData.databricksData.path}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      databricksData: {
                        ...formData.databricksData,
                        path: e.target.value,
                      },
                    })
                  }
                  onBlur={() => handleShowErrors("databricksData")}
                  className={classNames(
                    errors.databricksData.length > 0 &&
                      showErrors.databricksData
                      ? "rounded-md sm:text-sm focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500 "
                      : "rounded-md sm:text-sm focus:border-cyan-500 border-gray-300 shadow-sm focus:ring-cyan-500 "
                  )}
                  name="httpPath"
                  placeholder="http path"
                  label="Http path"
                />
                {errors.databricksData.length > 0 && showErrors.databricksData && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dd className="relative">
                <Input
                  value={formData.databricksData.token}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      databricksData: {
                        ...formData.databricksData,
                        token: e.target.value,
                      },
                    });
                    handleShowErrors("databricksData");
                  }}
                  onBlur={() => handleShowErrors("databricksData")}
                  type="password"
                  className={classNames(
                    errors.databricksData.length > 0 &&
                      showErrors.databricksData
                      ? "rounded-md sm:text-sm focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500 "
                      : "rounded-md sm:text-sm focus:border-cyan-500 border-gray-300 shadow-sm focus:ring-cyan-500 "
                  )}
                  name="token"
                  placeholder="token"
                  label="Token"
                />
                {errors.databricksData.length > 0 && showErrors.databricksData && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </dd>
            </div>
            {showErrors.databricksData &&
              errors.databricksData.map((item) => (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="email-error"
                  key={item}
                >
                  {item}
                </p>
              ))}
          </div>
        ) : (
          <div>
            <div>
              <b>Connection string</b>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-[0.75rem] flex items-center pr-3 z-[9999]">
                  <span
                    className="text-gray-500 sm:text-sm"
                    id="price-currency"
                  >
                    {protocols[dbType]}
                  </span>
                </div>
                <Input
                  value={formData.connectionString.replace(
                    protocols[dbType],
                    ""
                  )}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      connectionString: protocols[dbType] + e.target.value,
                    })
                  }
                  className="pl-[120px]"
                  name="connectionString"
                />
              </div>
            </div>
            <div className="mt-[20px] flex flex-col gap-[10px]">
              <b>Params separeted</b>
              <div className="flex justify-between items-center gap-[20px]">
                <Input
                  name="host"
                  placeholder="host"
                  wrapperClasses="flex-[3]"
                  label="Host"
                />
                <Input
                  name="port"
                  type="number"
                  placeholder="port"
                  wrapperClasses="flex-[1]"
                  label="Port"
                />
              </div>
              <Input name="username" placeholder="username" label="Username" />
              <Input
                type="password"
                name="password"
                placeholder="password"
                label="Password"
              />
              <Input name="database" placeholder="database" label="Database" />
            </div>
          </div>
        ))}
    </div>
  );
};

export default DatabaseStep3;