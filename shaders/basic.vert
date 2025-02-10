#version 410 core

layout(location=0) in vec3 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vTexCoords;

out vec3 fPosition;
out vec3 fNormal;
out vec2 fTexCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

//lighting
//uniform vec3 lightColor;
//uniform vec3 baseColor;
//out vec3 color;
//vec3 ambient;
//float ambientStrength=0.2f;

void main() 
{
    //ambient=ambientStrength * lightColor;
	//color=min(ambient*baseColor, 1.0f);
	gl_Position = projection * view * model * vec4(vPosition, 1.0f);
	fPosition = vPosition;
	fNormal = vNormal;
	fTexCoords = vTexCoords;
}
