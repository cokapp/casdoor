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

//go:build !skipCi
// +build !skipCi

package deployment

import (
	"os"
	"testing"

	"github.com/casdoor/casdoor/object"
)

func TestCdn(t *testing.T) {
	provider := &object.Provider{
		Owner:        getEnvOrDefault("PROVIDER_OWNER", "admin"),
		Name:         getEnvOrDefault("PROVIDER_NAME", "qiniu"),
		Category:     getEnvOrDefault("PROVIDER_CATEGORY", "Storage"),
		Type:         getEnvOrDefault("PROVIDER_TYPE", "Qiniu Cloud Kodo"),
		ClientId:     getEnvOrDefault("PROVIDER_CLIENT_ID", ""),
		ClientSecret: getEnvOrDefault("PROVIDER_CLIENT_SECRET", ""),
		RegionId:     getEnvOrDefault("PROVIDER_REGION_ID", "huanan"),
		Bucket:       getEnvOrDefault("PROVIDER_BUCKET", ""),
		Endpoint:     getEnvOrDefault("PROVIDER_ENDPOINT", ""),
		Content:      getEnvOrDefault("PROVIDER_CONTENT", ""),
		Cert:         getEnvOrDefault("PROVIDER_CERT", ""),
		PathPrefix:   getEnvOrDefault("PROVIDER_PATH_PREFIX", ""),
	}
	deployStaticFiles(provider, getEnvOrDefault("BUILD_VERSION", "v1"))
}

// getEnvOrDefault 从环境变量读取值，如果不存在则返回默认值
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
