<script setup lang="ts">
import type { CSSProperties } from 'vue'
import {
  Alert,
  theme as antdTheme,
  Button,
  ConfigProvider,
  DatePicker,
  Flex,
  message,
  Modal,
  notification,
  Radio,
  RadioGroup,
  RangePicker,
  Space,
  Table,
} from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'

const theme = reactive({
  algorithm: antdTheme.defaultAlgorithm,
  hashed: false,
})
console.time('app')
onMounted(() => {
  console.timeLog('app')
})
const value = ref('horizontal')
const baseStyle: CSSProperties = {
  width: '25%',
  height: '54px',
}
const color = reactive({
  bg: '#fff',
  color: '#000',
})
function changeTheme(type: 'dark' | 'light') {
  if (type === 'dark') {
    theme.algorithm = antdTheme.darkAlgorithm
    color.bg = '#000'
    color.color = '#fff'
  }
  else {
    theme.algorithm = antdTheme.defaultAlgorithm
    color.bg = '#fff'
    color.color = '#000'
  }
}

const tableProps = reactive({
  dataSource: [
    {
      key: '1',
      name: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      name: 'John',
      age: 42,
      address: '10 Downing Street',
    },
  ],
  columns: [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ],
})

type StatusType = 'success' | 'info'

function handleMessage(type: StatusType) {
  if (type === 'success') {
    message.success('This is a prompt message for success, and it will disappear in 10 seconds', 10)
  }
  else if (type === 'info') {
    message.info('This is a prompt message for info, and it will disappear in 10 seconds', 10)
  }
}

function handleModal(type: StatusType) {
  if (type === 'success') {
    Modal.success({
      title: 'This is a success message',
      content: 'some messages...some messages...',
    })
  }
  else if (type === 'info') {
    Modal.info({
      title: 'This is a info message',
      content: 'some messages...some messages...',
    })
  }
}

function handleNotification(type: StatusType) {
  if (type === 'success') {
    notification.success({
      message: 'Notification Title',
      description:
        'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    })
  }
  else if (type === 'info') {
    notification.info({
      message: 'Notification Title',
      description:
        'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    })
  }
}
</script>

<template>
  <ConfigProvider
    :theme="theme"
  >
    <div class="container">
      <DatePicker />
      <DatePicker picker="week" />
      <RangePicker />
      <RangePicker picker="week" />
      <div>
        <Space>
          <Button @click="changeTheme('dark')">
            dark
          </Button>
          <Button @click="changeTheme('light')">
            light
          </Button>
        </Space>
      </div>
      <Alert
        message="Success Text"
        type="success"
      />
      <div>
        icon:
        <AlertFilled />
        <LoadingOutlined />
      </div>
      <Table v-bind="tableProps" />
      <Space>
        <Button
          type="primary"
          @click="handleMessage('success')"
        >
          message success
        </Button>
        <Button @click="handleMessage('info')">
          message info
        </Button>
      </Space>
      <Space>
        <Button
          type="primary"
          @click="handleModal('success')"
        >
          modal success
        </Button>
        <Button @click="handleModal('info')">
          modal info
        </Button>
      </Space>
      <Space>
        <Button
          type="primary"
          @click="handleNotification('success')"
        >
          notification success
        </Button>
        <Button @click="handleNotification('info')">
          notification info
        </Button>
      </Space>
      <Flex
        gap="middle"
        vertical
      >
        <RadioGroup v-model:value="value" group>
          <Radio value="horizontal">
            horizontal
          </Radio>
          <Radio value="vertical">
            vertical
          </Radio>
        </RadioGroup>
        <Flex :vertical="value === 'vertical'">
          <div
            v-for="(item, index) in new Array(4)"
            :key="item"
            :style="{ ...baseStyle, background: `${index % 2 ? '#1677ff' : '#1677ffbf'}` }"
          />
        </Flex>
      </Flex>
    </div>
  </ConfigProvider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}

.container {
  padding: 10px;
  display: flex;
  overflow-x: hidden;
  overflow-y: auto;
  flex-direction: column;
  gap: 10px;
  height: 100vh;
  width: 100vw;
  background-color: v-bind('color.bg');
  color: v-bind('color.color');
}
</style>
