/*
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Send a message to the client.
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function (clients){
    clients.forEach(function(client){
      let url = new URL(client.url);
      let id = url.pathname.split('/')[2];
      if (id == event.notification.tag) {
        if (!event.action) {
          client.focus();
        }
        else {
          client.postMessage({action: event.action});
        }
      }
    });
  });
  event.waitUntil(promiseChain);
}, false);
