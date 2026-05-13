import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';

import { shareMessage } from './BUS/shareHelper';

const normalizeName = (value) => `${value ?? ''}`.trim().toLowerCase();

export const resolveBusCategoryServices = (category, services = []) => {
  const servicesById = new Map(
    services
      .filter((service) => service?.id !== null && service?.id !== undefined)
      .map((service) => [`${service.id}`, service])
  );
  const servicesByName = new Map(
    services
      .filter((service) => !!normalizeName(service?.name))
      .map((service) => [normalizeName(service.name), service])
  );

  return (category?.publicServiceTypes ?? [])
    .map((serviceReference) => {
      const serviceId = serviceReference?.id;
      const serviceName = serviceReference?.name;

      return (
        servicesById.get(`${serviceId ?? ''}`) ||
        servicesByName.get(normalizeName(serviceName)) || {
          id: serviceId,
          name: serviceName
        }
      );
    })
    .filter(
      (service) =>
        service?.id !== null && service?.id !== undefined && !!normalizeName(service?.name)
    );
};

export const mapBusServicesToListItems = (areaId, services = []) =>
  _sortBy(
    _filter(services, (busService) => !!busService?.name),
    (busService) => busService.name.toUpperCase()
  ).map((busService) => ({
    id: busService.id,
    title: busService.name,
    routeName: 'BusDetail',
    params: {
      areaId,
      title: busService.name,
      query: '',
      queryVariables: {},
      rootRouteName: 'BUS',
      shareContent: {
        message: shareMessage(busService)
      },
      data: busService
    }
  }));
