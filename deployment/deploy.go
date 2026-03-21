// Copyright 2022 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package deployment

import (
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/casdoor/casdoor/object"
	"github.com/casdoor/casdoor/storage"
	"github.com/casdoor/casdoor/util"
	"github.com/casdoor/oss"
)

func deployStaticFiles(provider *object.Provider, buildVersion string) {
	certificate := ""
	if provider.Category == "Storage" && provider.Type == "Casdoor" {
		cert, err := object.GetCert(util.GetId(provider.Owner, provider.Cert))
		if err != nil {
			panic(err)
		}
		if cert == nil {
			panic(err)
		}
		certificate = cert.Certificate
	}
	storageProvider, err := storage.GetStorageProvider(provider.Type, provider.ClientId, provider.ClientSecret, provider.RegionId, provider.Bucket, provider.Endpoint, certificate, provider.Content)
	if err != nil {
		panic(err)
	}
	if storageProvider == nil {
		panic(fmt.Sprintf("the provider type: %s is not supported", provider.Type))
	}

	// 这里的逻辑是： provider.PathPrefix是固定的cdn目录，buildVersion是版本号
	// 同时，使用 PUBLIC_URL=${{ vars.CDN_DOMAIN }}/${{ vars.PROVIDER_PATH_PREFIX }}/${{ steps.get-current-tag.outputs.tag }}/ yarn run build 构建的前端页面
	// 要求静态文件保存在cdn的如下目录：/${{ vars.PROVIDER_PATH_PREFIX }}/${{ steps.get-current-tag.outputs.tag }}/static/
	pathPrefix := path.Join(provider.PathPrefix, buildVersion, "static")

	fmt.Printf("buildVersion: %s, pathPrefix: %s\n", buildVersion, pathPrefix)

	uploadFolder(storageProvider, pathPrefix, "js")
	uploadFolder(storageProvider, pathPrefix, "css")
}

func uploadFolder(storageProvider oss.StorageInterface, pathPrefix string, folder string) {
	path := fmt.Sprintf("../web/build/static/%s/", folder)
	filenames := util.ListFiles(path)

	for _, filename := range filenames {
		if !strings.HasSuffix(filename, folder) {
			continue
		}

		file, err := os.Open(filepath.Clean(path + filename))
		if err != nil {
			panic(err)
		}

		objectKey := fmt.Sprintf("%s/%s/%s", pathPrefix, folder, filename)
		_, err = storageProvider.Put(objectKey, file)
		if err != nil {
			panic(err)
		}

		fmt.Printf("Uploaded [%s] to [%s]\n", path, objectKey)
	}
}
