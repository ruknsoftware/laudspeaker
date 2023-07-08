import { RadioGroup } from "@headlessui/react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { Input } from "components/Elements";
import SaveSettings from "components/SaveSettings";
import { ChangeEvent, FocusEvent, ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDebounce } from "react-use";
import ApiService from "services/api.service";

const memoryOptions: Record<
  string,
  { id: string; name: string; inStock: boolean }
> = {
  twilio: { id: "twilio", name: "Twilio", inStock: true },
  msegat: { id: "msegat", name: "Msegat", inStock: true },
  vonage: { id: "vonage", name: "Vonage", inStock: false },
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SettingsSMSBeta() {
  const [smsProvider, setSmsProvider] = useState("twilio");
  const mem = memoryOptions[smsProvider];

  const [formData, setFormData] = useState({
    smsAccountSid: "",
    smsAuthToken: "",
    smsFrom: "",

    msegatApiKey: "",
    msegatUserName: "",
    msegatUserSender: "",
  });

  const [showErrors, setShowErrors] = useState({
    smsAccountSid: false,
    smsAuthToken: false,
    smsFrom: false,

    msegatApiKey: false,
    msegatUserName: false,
    msegatUserSender: false,
  });

  const [twilioErrors, setTwilioErrors] = useState<{
    [key: string]: string[];
  }>({
    smsAccountSid: [],
    smsAuthToken: [],
    smsFrom: [],
  });

  const [msegatErrors, setMsegatErrors] = useState<{
    [key: string]: string[];
  }>({
    msegatApiKey: [],
    msegatUserName: [],
    msegatUserSender: [],
  });

  const [possibleNumbers, setPossibleNumbers] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data } = await ApiService.get({ url: "/accounts" });
        const {
          smsAccountSid,
          smsAuthToken,
          smsFrom,
          msegatApiKey,
          msegatUserName,
          msegatUserSender,
        } = data;
        setFormData({
          smsAccountSid: smsAccountSid || "",
          smsAuthToken: smsAuthToken || "",
          smsFrom: smsFrom || "",
          msegatApiKey: msegatApiKey || "",
          msegatUserName: msegatUserName || "",
          msegatUserSender: msegatUserSender || "",
        });
      } catch (e) {
        toast.error("Error while loading data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setShowErrors({
      smsAccountSid: false,
      smsAuthToken: false,
      smsFrom: false,

      msegatApiKey: false,
      msegatUserName: false,
      msegatUserSender: false,
    });
  }, [smsProvider]);

  useEffect(() => {
    const newTwilioErrors: { [key: string]: string[] } = {
      smsAccountSid: [],
      smsAuthToken: [],
      smsFrom: [],
    };

    const newMsegatErrors: { [key: string]: string[] } = {
      msegatApiKey: [],
      msegatUserName: [],
      msegatUserSender: [],
    };

    switch (smsProvider) {
      case "twilio": {
        if (!formData.smsAccountSid) {
          newTwilioErrors.smsAccountSid.push("Account sid must be defined");
        }

        if (!formData.smsAuthToken) {
          newTwilioErrors.smsAuthToken.push("Auth token must be defined");
        }

        if (!formData.smsFrom) {
          newTwilioErrors.smsFrom.push("Sms from must be defined");
        }
        break;
      }
      case "msegat": {
        if (!formData.msegatApiKey) {
          newMsegatErrors.msegatApiKey.push("Api key must be defined");
        }

        if (!formData.msegatUserName) {
          newMsegatErrors.msegatUserName.push("User name must be defined");
        }

        if (!formData.msegatUserSender) {
          newMsegatErrors.msegatUserSender.push("Sender must be defined");
        }
        break;
      }
    }
    setTwilioErrors(newTwilioErrors);
    setMsegatErrors(newMsegatErrors);
  }, [formData, smsProvider]);

  const loadPossibleNumbers = async (
    smsAccountSid: string,
    smsAuthToken: string
  ) => {
    const { data } = await ApiService.get({
      url: `/sms/possible-phone-numbers?smsAccountSid=${smsAccountSid}&smsAuthToken=${smsAuthToken}`,
    });

    setPossibleNumbers(data || []);
  };

  useDebounce(
    () => {
      if (formData.smsAccountSid && formData.smsAuthToken)
        loadPossibleNumbers(formData.smsAccountSid, formData.smsAuthToken);
    },
    1000,
    [formData]
  );

  const handleFormDataChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.target.value.includes(" ")) {
      e.target.value = e.target.value.replaceAll(" ", "");
      toast.error("Value should not contain spaces!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e: FocusEvent<HTMLSelectElement>) => {
    setShowErrors({ ...showErrors, [e.target.name]: true });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await ApiService.patch({
        url: "/accounts",
        options: { ...formData },
      });
    } catch (e) {
      toast.error("Unexpected error");
    }
  };

  const isError = Object.values(twilioErrors).some((item) => item.length > 0);

  const configuration: Record<string, ReactNode> = {
    twilio: (
      <div>
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
          <dt className="text-sm font-medium text-gray-500">
            Twilio account sid
          </dt>
          <dd>
            <div className="relative rounded-md min-w-[260px]">
              <Input
                type="text"
                value={formData.smsAccountSid}
                onChange={handleFormDataChange}
                name="smsAccountSid"
                id="smsAccountSid"
                className={`rounded-md shadow-sm sm:text-sm ${
                  showErrors.smsAccountSid &&
                  twilioErrors.smsAccountSid.length > 0
                    ? "focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500"
                    : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                }`}
                onBlur={handleBlur}
              />
              {showErrors.smsAccountSid &&
                twilioErrors.smsAccountSid.length > 0 && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
            </div>
            {showErrors.smsAccountSid &&
              twilioErrors.smsAccountSid.map((item) => (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="email-error"
                  key={item}
                >
                  {item}
                </p>
              ))}
          </dd>
        </div>
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
          <dt className="text-sm font-medium text-gray-500">
            Twilio auth token
          </dt>
          <dd>
            <div className="relative rounded-md min-w-[260px]">
              <Input
                type="text"
                value={formData.smsAuthToken}
                onChange={handleFormDataChange}
                name="smsAuthToken"
                id="smsAuthToken"
                className={`rounded-md shadow-sm sm:text-sm ${
                  showErrors.smsAuthToken &&
                  twilioErrors.smsAuthToken.length > 0
                    ? "focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500"
                    : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                }`}
                onBlur={handleBlur}
              />
              {showErrors.smsAuthToken &&
                twilioErrors.smsAuthToken.length > 0 && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
            </div>
            {showErrors.smsAuthToken &&
              twilioErrors.smsAuthToken.map((item) => (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="email-error"
                  key={item}
                >
                  {item}
                </p>
              ))}
          </dd>
        </div>
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
          <dt className="text-sm font-medium text-gray-500">Sms From</dt>
          <dd>
            <div className="relative rounded-md min-w-[260px]">
              <select
                id="smsFrom"
                name="smsFrom"
                disabled={
                  !formData.smsAccountSid ||
                  !formData.smsAuthToken ||
                  possibleNumbers.length === 0
                }
                value={formData.smsFrom}
                onChange={handleFormDataChange}
                className={`mt-1 block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm ${
                  twilioErrors.smsFrom.length > 0 && showErrors.smsFrom
                    ? "focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500"
                    : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                }`}
                onBlur={handleBlur}
              >
                <option value={formData.smsFrom}>{formData.smsFrom}</option>
                {possibleNumbers.map((item) => (
                  <option value={item}>{item}</option>
                ))}
              </select>
              {showErrors.smsFrom && twilioErrors.smsFrom.length > 0 && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            {showErrors.smsFrom &&
              twilioErrors.smsFrom.map((item) => (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="email-error"
                  key={item}
                >
                  {item}
                </p>
              ))}
          </dd>
        </div>
      </div>
    ),
    msegat: (
      <div>
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
          <dt className="text-sm font-medium text-gray-500">Msegat API Key</dt>
          <dd>
            <div className="relative rounded-md min-w-[260px]">
              <Input
                type="text"
                value={formData.msegatApiKey}
                onChange={handleFormDataChange}
                name="msegatApiKey"
                id="msegatApiKey"
                className={`rounded-md shadow-sm sm:text-sm ${
                  showErrors.msegatApiKey &&
                  msegatErrors.msegatApiKey.length > 0
                    ? "focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500"
                    : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                }`}
                onBlur={handleBlur}
              />
              {showErrors.msegatApiKey &&
                msegatErrors.msegatApiKey.length > 0 && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
            </div>
            {showErrors.msegatApiKey &&
              msegatErrors.msegatApiKey.map((item) => (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="email-error"
                  key={item}
                >
                  {item}
                </p>
              ))}
          </dd>
        </div>
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
          <dt className="text-sm font-medium text-gray-500">Msegat Username</dt>
          <dd>
            <div className="relative rounded-md min-w-[260px]">
              <Input
                type="text"
                value={formData.msegatUserName}
                onChange={handleFormDataChange}
                name="msegatUserName"
                id="msegatUserName"
                className={`rounded-md shadow-sm sm:text-sm ${
                  showErrors.msegatUserName &&
                  msegatErrors.msegatUserName.length > 0
                    ? "focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500"
                    : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                }`}
                onBlur={handleBlur}
              />
              {showErrors.msegatUserName &&
                msegatErrors.msegatUserName.length > 0 && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
            </div>
            {showErrors.msegatUserName &&
              msegatErrors.msegatUserName.map((item) => (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="email-error"
                  key={item}
                >
                  {item}
                </p>
              ))}
          </dd>
        </div>
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
          <dt className="text-sm font-medium text-gray-500">
            Msegat User Sender
          </dt>
          <dd>
            <div className="relative rounded-md min-w-[260px]">
              <Input
                type="text"
                value={formData.msegatUserSender}
                onChange={handleFormDataChange}
                name="msegatUserSender"
                id="msegatUserSender"
                className={`rounded-md shadow-sm sm:text-sm ${
                  showErrors.msegatUserSender &&
                  msegatErrors.msegatUserSender.length > 0
                    ? "focus:!border-red-500 !border-red-300 shadow-sm focus:!ring-red-500"
                    : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                }`}
                onBlur={handleBlur}
              />
              {showErrors.msegatUserSender &&
                msegatErrors.msegatUserSender.length > 0 && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
            </div>
            {showErrors.msegatUserSender &&
              msegatErrors.msegatUserSender.map((item) => (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="email-error"
                  key={item}
                >
                  {item}
                </p>
              ))}
          </dd>
        </div>
      </div>
    ),
  };

  return (
    <>
      <div className="mt-10 divide-y divide-gray-200">
        <div className="space-y-10">
          <RadioGroup
            value={mem}
            onChange={(m) => setSmsProvider(m.id)}
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
        <div className="mt-6">
          <dl className="divide-y divide-gray-200">
            {configuration[smsProvider]}
            <SaveSettings
              disabled={isError || isLoading}
              onClick={handleSubmit}
            />
          </dl>
        </div>
      </div>
    </>
  );
}
