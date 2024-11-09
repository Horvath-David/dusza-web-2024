// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks } from "@generouted/solid-router/client";

export type Path =
  | `/`
  | `/auth`
  | `/auth/login`
  | `/auth/register`
  | `/categories`
  | `/edit-team`
  | `/new-team`
  | `/programming_langs`
  | `/school-test`
  | `/schools`
  | `/teams`;

export type Params = {};

export type ModalPath = never;

export const { A, Navigate } = components<Path, Params>();
export const { useMatch, useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
