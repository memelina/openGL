#version 410 core

// Input-uri din vertex shader
in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords;

// Output către framebuffer
out vec4 fColor;

// Uniforme pentru lumină
uniform vec3 lightDir;
uniform vec3 lightColor;

// Texturi pentru teren
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;

// Variabile globale pentru lumină
vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 32.0f;

// Shadow mapping
in vec4 fragPosLightSpace;
uniform sampler2D shadowMap;



// Uniformă pentru normal map-ul apei
uniform sampler2D normalMap;

void computeLightComponents() {
    vec3 cameraPosEye = vec3(0.0f); // Camera la origine în coordonate Eye
    vec3 normalEye = normalize(fNormal);
    vec3 lightDirN = normalize(lightDir);
    vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);

    // Calculul componentelor de iluminare
    ambient = ambientStrength * lightColor;
    diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
    vec3 reflection = reflect(-lightDirN, normalEye);
    float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
    specular = specularStrength * specCoeff * lightColor;
}

float computeShadow() {
    vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    normalizedCoords = normalizedCoords * 0.5 + 0.5;

    if (normalizedCoords.x < 0.0 || normalizedCoords.x > 1.0 ||
        normalizedCoords.y < 0.0 || normalizedCoords.y > 1.0)
        return 0.0f;

    float closestDepth = texture(shadowMap, normalizedCoords.xy).r;
    float currentDepth = normalizedCoords.z;
    vec3 lightDirN = normalize(lightDir);
    float bias = max(0.005 * (1.0 - dot(fNormal, lightDirN)), 0.01);

    float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;

    if (normalizedCoords.z > 1.0)
        return 0.0f;

    return shadow;
}

float computeFog() {
    float fogDensity = 0.01f;
    float fragmentDistance = length(fPosEye.xyz);
    float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));
    return clamp(fogFactor, 0.0f, 1.0f);
}


void main() {
    computeLightComponents();

        // Procesare pentru teren
        vec3 baseColor = vec3(0.9f, 0.35f, 0.0f);
        ambient *= texture(diffuseTexture, fTexCoords).rgb;
        diffuse *= texture(diffuseTexture, fTexCoords).rgb;
        specular *= texture(specularTexture, fTexCoords).rgb;

        float shadow = computeShadow();
        vec3 terrainColor = min((ambient + (1.0f - shadow) * diffuse) + (1.0f - shadow) * specular, 1.0f);

        vec4 colorFromTexture = texture(diffuseTexture, fTexCoords);

        if (colorFromTexture.a < 0.1) {
            discard; // Eliminăm fragmentul dacă este complet transparent
        }

        float fogFactor = computeFog();
        vec4 fogColor = vec4(0.9f, 0.7f, 0.4f, 1.0f); // Culoarea ceții

        // Aplicăm efectul de ceață
        vec4 finalColor = mix(fogColor, vec4(terrainColor, 1.0) * colorFromTexture, fogFactor);

        // Setăm culoarea finală pentru teren
        fColor = finalColor;
    
    

}
