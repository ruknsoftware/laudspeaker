/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-describe-callback */
/* eslint-disable @typescript-eslint/no-shadow */
import credentials from "../fixtures/credentials.json";
import createNewSegment from "../test-helpers/createNewSegment";
import { loginFunc } from "../test-helpers/loginFunc";
import setupEventTrigger from "../test-helpers/setupEventTrigger";
import { tamplatesFunc } from "../test-helpers/templatesFunc";

const {
  email,
  password,
  slackTemplate,
  emailTemplate,
  smsTemplate,
  userAPIkey,
} = credentials.MessageHitUser;

describe(
  "Multiple triggers",
  { env: { AxiosURL: "http://localhost:3001/" } },
  () => {
    beforeEach(() => {
      cy.request("http://localhost:3001/tests/reset-tests");
      cy.wait(1000);
    });

    it("passes", () => {
      loginFunc(email, password);
      tamplatesFunc();

      cy.get('[data-disclosure-link="Journey Builder"]').click();
      cy.wait(1000);
      cy.get("button").contains("Create Journey").click();
      cy.get("#name").should("exist").type("Multiple triggers flow");
      cy.get("#createJourneySubmit").click();
      cy.wait(3000);
      cy.get("#audience").click();
      cy.get("#name").type("init");
      cy.get("#description").type("init description text");
      cy.get("#saveNewSegment").click();

      cy.get(".react-flow__viewport")
        .get('[data-isprimary="true"]')
        .move({ deltaX: 100, deltaY: 100 });

      cy.wait(3000);
      cy.get("#audience").click();
      cy.get("#name").type("sms audience");
      cy.get("#description").type("sms description");
      cy.get("#saveNewSegment").click();

      cy.get(".react-flow__viewport")
        .get('[data-isprimary="false"]')
        .move({ deltaX: 50, deltaY: 300 });

      cy.get('[data-isprimary="false"]').click();
      cy.get("#sms > .p-0 > .justify-between").click();
      cy.get("#activeJourney").click();
      cy.contains(smsTemplate.name).click();
      cy.get("#exportSelectedTemplate").click();

      cy.get(".react-flow__viewport").get('[data-isprimary="true"]').click();
      setupEventTrigger(smsTemplate.eventName, smsTemplate.eventName);

      cy.get('[data-isprimary="true"]')
        .get('[data-handlepos="bottom"]')
        .drag('[data-isprimary="false"] [data-handlepos="top"]', {
          force: true,
        });

      cy.get('[data-isprimary="false"] [data-handlepos="top"]').click();

      cy.wait(3000);
      cy.get("#audience").click();
      cy.get("#name").type("email audience");
      cy.get("#description").type("email description");
      cy.get("#saveNewSegment").click();
      cy.contains("email audience").move({ deltaX: 450, deltaY: 300 }).click();
      cy.get("#email").click();
      cy.get("#activeJourney").click();
      cy.contains(emailTemplate.name).click();
      cy.get("#exportSelectedTemplate").click();
      cy.get(".react-flow__viewport").get('[data-isprimary="true"]').click();
      setupEventTrigger(emailTemplate.eventName, emailTemplate.eventName);

      cy.get('[data-handlepos="bottom"]:last').drag(
        '[data-isprimary="false"] [data-handlepos="top"]:last',
        { force: true }
      );
      cy.get('[data-isprimary="false"] [data-handlepos="top"]:last').click();

      createNewSegment();

      cy.contains("Save").click();
      cy.wait(500);
      cy.contains("Start").click();
      cy.wait(500);

      cy.visit("/flow");
      cy.wait(3000);

      cy.request({
        method: "POST",
        url: `${Cypress.env("AxiosURL")}events`,
        headers: {
          Authorization: `Api-Key ${userAPIkey}`,
        },
        body: {
          correlationKey: "phone",
          correlationValue: Cypress.env("TESTS_SMS_TO") || smsTemplate.phone,
          event: { [smsTemplate.eventName]: smsTemplate.eventName },
        },
      }).then(({ body }) => {
        cy.wait(2000);
        cy.request({
          method: "POST",
          headers: {
            Authorization: `Api-Key ${userAPIkey}`,
          },
          url: `${Cypress.env("AxiosURL")}events/job-status/sms`,
          body: {
            jobId: body[0]?.jobIds?.[0],
          },
        }).then(({ body }) => {
          expect(body).to.equal("completed");
        });
      });

      cy.request({
        method: "POST",
        url: `${Cypress.env("AxiosURL")}events`,
        headers: {
          Authorization: `Api-Key ${userAPIkey}`,
        },
        body: {
          correlationKey: "email",
          correlationValue: emailTemplate.correlationValue,
          event: { [emailTemplate.eventName]: emailTemplate.eventName },
        },
      }).then(({ body }) => {
        cy.wait(2000);
        cy.request({
          method: "POST",
          headers: {
            Authorization: `Api-Key ${userAPIkey}`,
          },
          url: `${Cypress.env("AxiosURL")}events/job-status/email`,
          body: {
            jobId: body[0]?.jobIds?.[0],
          },
        }).then(({ body }) => {
          expect(body).to.equal("completed");
        });
      });
    });
  }
);
